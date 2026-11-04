import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import authRoutes from '../modules/auth/auth.route';
import userRoutes from '../modules/users/user.route';
import periodeRoutes from '../modules/kepengurusan/periode/periode.route';
import pengurusRoutes from '../modules/kepengurusan/pengurus/pengurus.route';
import kegiatanRoutes from '../modules/kegiatan/kegiatan.route';
import panitiaRoutes from '../modules/panitia/panitia.route';
import absensiRoutes from '../modules/absensi/absensi.route';
import notulenRoutes from '../modules/administrasi/notulen/notulen.route';
import suratRoutes from '../modules/administrasi/surat/surat.route';
import pengumumanRoutes from '../modules/administrasi/pengumuman/pengumuman.route';
import kategoriRoutes from '../modules/keuangan/kategori-keuangan/kategori.route';
import transaksiRoutes from '../modules/keuangan/transaksi/transaksi.route';
import iuranRoutes from '../modules/keuangan/iuran/iuran.route';
import anggaranRoutes from '../modules/keuangan/anggaran/anggaran.route';
import feedbackRoutes from '../modules/feedback/feedback.route';
import auditRoutes from '../modules/audit/audit.route';
import dashboardRoutes from '../modules/dashboard/dashboard.route';

const router = Router();

router.use('/auth', authRoutes);

router.use(authenticate);
router.use('/users', userRoutes);
router.use('/periode', periodeRoutes);
router.use('/pengurus', pengurusRoutes);
router.use('/kegiatan', kegiatanRoutes);
router.use('/panitia', panitiaRoutes);
router.use('/absensi', absensiRoutes);
router.use('/notulen', notulenRoutes);
router.use('/surat', suratRoutes);
router.use('/pengumuman', pengumumanRoutes);
router.use('/kategori-keuangan', kategoriRoutes);
router.use('/transaksi', transaksiRoutes);
router.use('/iuran', iuranRoutes);
router.use('/anggaran', anggaranRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/audit', auditRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
