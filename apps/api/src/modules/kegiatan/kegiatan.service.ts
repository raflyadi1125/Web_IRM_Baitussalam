import { all, and, db } from '../../config/database';
import { AppError } from '../../shared/errors/app-error';
import { buildMeta } from '../../shared/utils/pagination';
import { logAudit } from '../audit/audit.service';
import type { CreateKegiatanInput, ListKegiatanQuery, UpdateKegiatanInput } from './kegiatan.validation';

// Escape karakter khusus LIKE agar pencarian "50%" tidak dianggap pola.
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

export const list = async ({ status, periodeId, search, page, limit }: ListKegiatanQuery) => {
  const base = db.orm.public.Kegiatan.where((k) =>
    and(
      status ? k.status.eq(status) : all(),
      periodeId ? k.periodeId.eq(periodeId) : all(),
      search ? k.judul.ilike(likePattern(search)) : all(),
    ),
  );

  const [items, { total }] = await Promise.all([
    base
      .orderBy((k) => k.tanggalMulai.desc())
      .limit(limit)
      .offset((page - 1) * limit)
      .all(),
    base.aggregate((agg) => ({ total: agg.count() })),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
};

export const getById = async (id: number) => {
  const item = await db.orm.public.Kegiatan.where({ id })
    .include('periode', (p) => p.select('id', 'nama'))
    .first();
  if (!item) throw new AppError('Kegiatan tidak ditemukan', 404);

  const panitia = await db.orm.public.PanitiaKegiatan.where({ kegiatanId: id })
    .include('user', (u) => u.select('id', 'nama'))
    .all();

  return { ...item, panitia };
};

export const create = async (input: CreateKegiatanInput, actorId: number) => {
  const item = await db.orm.public.Kegiatan.create({ ...input, dibuatOlehId: actorId });
  await logAudit(actorId, 'CREATE', 'Kegiatan', item.id, { judul: item.judul });
  return item;
};

export const update = async (id: number, input: UpdateKegiatanInput, actorId: number) => {
  if (Object.keys(input).length === 0) throw new AppError('Tidak ada data yang diubah', 400);
  const item = await db.orm.public.Kegiatan.where({ id }).update(input);
  if (!item) throw new AppError('Kegiatan tidak ditemukan', 404);
  await logAudit(actorId, 'UPDATE', 'Kegiatan', id, { fields: Object.keys(input) });
  return item;
};

export const remove = async (id: number, actorId: number) => {
  const item = await db.orm.public.Kegiatan.where({ id }).delete();
  if (!item) throw new AppError('Kegiatan tidak ditemukan', 404);
  await logAudit(actorId, 'DELETE', 'Kegiatan', id, { judul: item.judul });
};