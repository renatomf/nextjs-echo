import { ConvexError, v } from "convex/values";
import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { action, mutation } from "../_generated/server";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";

/** Normaliza MIME e tenta adivinhar se não informado */
function guessMimeType(filename: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  ).toLowerCase();
}

/** Deleta um arquivo do RAG e do storage */
export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const namespace = await rag.getNamespace(ctx, { namespace: orgId });
    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid namespace",
      });
    }

    const entry = await rag.getEntry(ctx, { entryId: args.entryId });
    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      });
    }

    // Deleta do storage, mas não falha se storageId for inválido
    if (entry.metadata?.storageId) {
      try {
        await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
      } catch (err) {
        console.warn("Failed to delete storage file:", err);
      }
    }

    // Deleta do RAG
    await rag.deleteAsync(ctx, { entryId: args.entryId });
  },
});

/** Adiciona arquivo ao RAG e ao storage */
export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.optional(v.string()),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const { bytes, filename, category } = args;
    const mimeType = (args.mimeType || guessMimeType(filename, bytes)).toLowerCase();

    // Cria blob e armazena
    const blob = new Blob([bytes], { type: mimeType });
    const storageId = await ctx.storage.store(blob);

    // Extrai texto do arquivo
    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    });

    // Adiciona ao RAG
    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId,
        uploadedBy: orgId,
        filename,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    // Se entry já existe, remove o arquivo duplicado
    if (!created) {
      console.debug("Entry already exists, deleting duplicate storage file");
      try {
        await ctx.storage.delete(storageId);
      } catch (err) {
        console.warn("Failed to delete duplicate storage file:", err);
      }
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    };
  },
});
