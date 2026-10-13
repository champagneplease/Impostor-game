import { z } from 'zod';

export const DifficultyLevelSchema = z.enum(['easy', 'medium', 'hard', 'all']);

export const WordItemSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  text: z.string().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  impostorHint: z.string().max(200).optional(),
  tags: z.array(z.string().min(1).max(30)).default([]),
  enabled: z.boolean().default(true),
});

export const CategoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().max(200).default(''),
  icon: z.string().default('Folder'),
  isCustom: z.boolean().optional(),
  enabled: z.boolean().default(true),
});

export const GameSettingsSchema = z.object({
  playerCount: z.number().int().min(3).max(20).default(4),
  impostorCount: z.number().int().min(1).max(5).default(1),
  selectedCategoryIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una categoría'),
  difficulty: DifficultyLevelSchema.default('all'),
  enableHints: z.boolean().default(true),
  showCategoryToAll: z.boolean().default(true),
  debateDurationSeconds: z.number().int().min(0).max(1800).default(180), // 3 min default, 0 = sin límite
  turnOrderRandomized: z.boolean().default(true),
  allowLastChanceGuess: z.boolean().default(true),
  allowSelfVote: z.boolean().default(false),
}).refine(data => data.impostorCount < data.playerCount, {
  message: 'La cantidad de impostores debe ser menor al número total de jugadores',
  path: ['impostorCount']
});

export const PlayerNameSchema = z
  .string()
  .trim()
  .min(1, 'El nombre no puede estar vacío')
  .max(25, 'El nombre no puede superar los 25 caracteres')
  .regex(/^[^<>]*$/, 'El nombre no puede contener caracteres inválidos');

export const RoomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{4,8}$/, 'Código de sala inválido');

export const VoteSubmissionSchema = z.object({
  targetId: z.string().min(1),
});

export const GuessSubmissionSchema = z.object({
  guess: z.string().trim().min(1).max(100),
});

export const ImportCategoriesPayloadSchema = z.object({
  version: z.number().int(),
  categories: z.array(CategoryItemSchema),
  words: z.array(WordItemSchema),
});
