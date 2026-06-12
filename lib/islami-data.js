/**
 * lib/islami-data.js — Data islami lokal (offline)
 * Doa harian, niat sholat, dzikir, sholawat, dan Asmaul Husna.
 */

export const DOA = {
  "bangun tidur": {
    arab: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    latin:
      "Alhamdulillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur",
    arti:
      "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dikembalikan.",
  },
  "sebelum tidur": {
    arab: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ",
    latin: "Bismikallaahumma ahyaa wa amuut",
    arti: "Dengan nama-Mu ya Allah, aku hidup dan aku mati.",
  },
  "sebelum makan": {
    arab: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    latin: "Allaahumma baarik lanaa fiimaa razaqtanaa wa qinaa 'adzaaban-naar",
    arti:
      "Ya Allah, berkahilah rezeki yang Engkau berikan dan jauhkan kami dari siksa neraka.",
  },
  "sesudah makan": {
    arab: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    latin: "Alhamdulillaahil-ladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin",
    arti:
      "Segala puji bagi Allah yang memberi kami makan dan minum serta menjadikan kami muslim.",
  },
  "masuk kamar mandi": {
    arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    latin: "Allaahumma innii a'uudzu bika minal-khubutsi wal-khabaa-its",
    arti: "Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan perempuan.",
  },
  "keluar kamar mandi": {
    arab: "غُفْرَانَكَ",
    latin: "Ghufraanaka",
    arti: "Aku memohon ampunan-Mu.",
  },
  "keluar rumah": {
    arab: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    latin: "Bismillaahi tawakkaltu 'alallaahi laa haula wa laa quwwata illaa billaah",
    arti:
      "Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dari Allah.",
  },
  "naik kendaraan": {
    arab: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    latin: "Subhaanal-ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahuu muqriniin",
    arti:
      "Maha Suci Allah yang menundukkan kendaraan ini bagi kami, padahal kami tidak mampu menguasainya.",
  },
  "kedua orang tua": {
    arab: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    latin: "Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa",
    arti:
      "Ya Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.",
  },
  "kebaikan dunia akhirat": {
    arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    latin:
      "Rabbanaa aatinaa fid-dun-yaa hasanah wa fil-aakhirati hasanah wa qinaa 'adzaaban-naar",
    arti:
      "Ya Tuhan kami, berilah kami kebaikan di dunia dan akhirat, serta lindungilah kami dari siksa neraka.",
  },
};

export const NIAT = {
  subuh: "أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى — Usholli fardhash-shubhi rak'ataini mustaqbilal-qiblati adaa-an lillaahi ta'aalaa",
  dzuhur:
    "أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى — Usholli fardhazh-zhuhri arba'a raka'aatin mustaqbilal-qiblati adaa-an lillaahi ta'aalaa",
  ashar:
    "أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى — Usholli fardhal-'ashri arba'a raka'aatin mustaqbilal-qiblati adaa-an lillaahi ta'aalaa",
  maghrib:
    "أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى — Usholli fardhal-maghribi tsalaatsa raka'aatin mustaqbilal-qiblati adaa-an lillaahi ta'aalaa",
  isya: "أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى — Usholli fardhal-'isyaa-i arba'a raka'aatin mustaqbilal-qiblati adaa-an lillaahi ta'aalaa",
};

export const DZIKIR = [
  "سُبْحَانَ اللَّهِ (Subhanallah) — Maha Suci Allah ×33",
  "الْحَمْدُ لِلَّهِ (Alhamdulillah) — Segala puji bagi Allah ×33",
  "اللَّهُ أَكْبَرُ (Allahu Akbar) — Allah Maha Besar ×33",
  "لَا إِلَهَ إِلَّا اللَّهُ (Laa ilaaha illallah) — Tiada Tuhan selain Allah",
  "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (Astaghfirullahal 'azhiim) — Aku memohon ampun kepada Allah Yang Maha Agung",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ (Laa haula wa laa quwwata illaa billaah)",
];

export const SHOLAWAT = [
  "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ\nAllaahumma sholli 'alaa sayyidinaa Muhammad wa 'alaa aali sayyidinaa Muhammad",
  "صَلَّى اللَّهُ عَلَى مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ\nShollallaahu 'alaa Muhammad, shollallaahu 'alaihi wa sallam",
];

/* Asmaul Husna — 99 nama Allah */
export const ASMAUL_HUSNA = [
  { ar: "الرَّحْمَنُ", latin: "Ar-Rahman", arti: "Yang Maha Pengasih" },
  { ar: "الرَّحِيمُ", latin: "Ar-Rahim", arti: "Yang Maha Penyayang" },
  { ar: "الْمَلِكُ", latin: "Al-Malik", arti: "Yang Maha Merajai" },
  { ar: "الْقُدُّوسُ", latin: "Al-Quddus", arti: "Yang Maha Suci" },
  { ar: "السَّلَامُ", latin: "As-Salam", arti: "Yang Maha Memberi Kesejahteraan" },
  { ar: "الْمُؤْمِنُ", latin: "Al-Mu'min", arti: "Yang Maha Memberi Keamanan" },
  { ar: "الْمُهَيْمِنُ", latin: "Al-Muhaimin", arti: "Yang Maha Memelihara" },
  { ar: "الْعَزِيزُ", latin: "Al-'Aziz", arti: "Yang Maha Perkasa" },
  { ar: "الْجَبَّارُ", latin: "Al-Jabbar", arti: "Yang Memiliki Kegagahan" },
  { ar: "الْمُتَكَبِّرُ", latin: "Al-Mutakabbir", arti: "Yang Maha Megah" },
  { ar: "الْخَالِقُ", latin: "Al-Khaliq", arti: "Yang Maha Pencipta" },
  { ar: "الْبَارِئُ", latin: "Al-Bari'", arti: "Yang Maha Mengadakan" },
  { ar: "الْمُصَوِّرُ", latin: "Al-Mushawwir", arti: "Yang Maha Membentuk Rupa" },
  { ar: "الْغَفَّارُ", latin: "Al-Ghaffar", arti: "Yang Maha Pengampun" },
  { ar: "الْقَهَّارُ", latin: "Al-Qahhar", arti: "Yang Maha Memaksa" },
  { ar: "الْوَهَّابُ", latin: "Al-Wahhab", arti: "Yang Maha Pemberi Karunia" },
  { ar: "الرَّزَّاقُ", latin: "Ar-Razzaq", arti: "Yang Maha Pemberi Rezeki" },
  { ar: "الْفَتَّاحُ", latin: "Al-Fattah", arti: "Yang Maha Pembuka Rahmat" },
  { ar: "الْعَلِيمُ", latin: "Al-'Alim", arti: "Yang Maha Mengetahui" },
  { ar: "الْقَابِضُ", latin: "Al-Qabidh", arti: "Yang Maha Menyempitkan" },
  { ar: "الْبَاسِطُ", latin: "Al-Basith", arti: "Yang Maha Melapangkan" },
  { ar: "الْخَافِضُ", latin: "Al-Khafidh", arti: "Yang Maha Merendahkan" },
  { ar: "الرَّافِعُ", latin: "Ar-Rafi'", arti: "Yang Maha Meninggikan" },
  { ar: "الْمُعِزُّ", latin: "Al-Mu'izz", arti: "Yang Maha Memuliakan" },
  { ar: "الْمُذِلُّ", latin: "Al-Mudzill", arti: "Yang Maha Menghinakan" },
  { ar: "السَّمِيعُ", latin: "As-Sami'", arti: "Yang Maha Mendengar" },
  { ar: "الْبَصِيرُ", latin: "Al-Bashir", arti: "Yang Maha Melihat" },
  { ar: "الْحَكَمُ", latin: "Al-Hakam", arti: "Yang Maha Menetapkan" },
  { ar: "الْعَدْلُ", latin: "Al-'Adl", arti: "Yang Maha Adil" },
  { ar: "اللَّطِيفُ", latin: "Al-Lathif", arti: "Yang Maha Lembut" },
  { ar: "الْخَبِيرُ", latin: "Al-Khabir", arti: "Yang Maha Mengetahui Rahasia" },
  { ar: "الْحَلِيمُ", latin: "Al-Halim", arti: "Yang Maha Penyantun" },
  { ar: "الْعَظِيمُ", latin: "Al-'Azhim", arti: "Yang Maha Agung" },
  { ar: "الْغَفُورُ", latin: "Al-Ghafur", arti: "Yang Maha Pengampun" },
  { ar: "الشَّكُورُ", latin: "Asy-Syakur", arti: "Yang Maha Pembalas Budi" },
  { ar: "الْعَلِيُّ", latin: "Al-'Aliyy", arti: "Yang Maha Tinggi" },
  { ar: "الْكَبِيرُ", latin: "Al-Kabir", arti: "Yang Maha Besar" },
  { ar: "الْحَفِيظُ", latin: "Al-Hafizh", arti: "Yang Maha Memelihara" },
  { ar: "الْمُقِيتُ", latin: "Al-Muqit", arti: "Yang Maha Pemberi Kecukupan" },
  { ar: "الْحَسِيبُ", latin: "Al-Hasib", arti: "Yang Maha Membuat Perhitungan" },
  { ar: "الْجَلِيلُ", latin: "Al-Jalil", arti: "Yang Maha Mulia" },
  { ar: "الْكَرِيمُ", latin: "Al-Karim", arti: "Yang Maha Pemurah" },
  { ar: "الرَّقِيبُ", latin: "Ar-Raqib", arti: "Yang Maha Mengawasi" },
  { ar: "الْمُجِيبُ", latin: "Al-Mujib", arti: "Yang Maha Mengabulkan" },
  { ar: "الْوَاسِعُ", latin: "Al-Wasi'", arti: "Yang Maha Luas" },
  { ar: "الْحَكِيمُ", latin: "Al-Hakim", arti: "Yang Maha Bijaksana" },
  { ar: "الْوَدُودُ", latin: "Al-Wadud", arti: "Yang Maha Mengasihi" },
  { ar: "الْمَجِيدُ", latin: "Al-Majid", arti: "Yang Maha Mulia" },
  { ar: "الْبَاعِثُ", latin: "Al-Ba'its", arti: "Yang Maha Membangkitkan" },
  { ar: "الشَّهِيدُ", latin: "Asy-Syahid", arti: "Yang Maha Menyaksikan" },
  { ar: "الْحَقُّ", latin: "Al-Haqq", arti: "Yang Maha Benar" },
  { ar: "الْوَكِيلُ", latin: "Al-Wakil", arti: "Yang Maha Memelihara" },
  { ar: "الْقَوِيُّ", latin: "Al-Qawiyy", arti: "Yang Maha Kuat" },
  { ar: "الْمَتِينُ", latin: "Al-Matin", arti: "Yang Maha Kokoh" },
  { ar: "الْوَلِيُّ", latin: "Al-Waliyy", arti: "Yang Maha Melindungi" },
  { ar: "الْحَمِيدُ", latin: "Al-Hamid", arti: "Yang Maha Terpuji" },
  { ar: "الْمُحْصِي", latin: "Al-Muhshi", arti: "Yang Maha Menghitung" },
  { ar: "الْمُبْدِئُ", latin: "Al-Mubdi'", arti: "Yang Maha Memulai" },
  { ar: "الْمُعِيدُ", latin: "Al-Mu'id", arti: "Yang Maha Mengembalikan" },
  { ar: "الْمُحْيِي", latin: "Al-Muhyi", arti: "Yang Maha Menghidupkan" },
  { ar: "الْمُمِيتُ", latin: "Al-Mumit", arti: "Yang Maha Mematikan" },
  { ar: "الْحَيُّ", latin: "Al-Hayy", arti: "Yang Maha Hidup" },
  { ar: "الْقَيُّومُ", latin: "Al-Qayyum", arti: "Yang Maha Mandiri" },
  { ar: "الْوَاجِدُ", latin: "Al-Wajid", arti: "Yang Maha Menemukan" },
  { ar: "الْمَاجِدُ", latin: "Al-Majid", arti: "Yang Maha Mulia" },
  { ar: "الْوَاحِدُ", latin: "Al-Wahid", arti: "Yang Maha Esa" },
  { ar: "الْأَحَدُ", latin: "Al-Ahad", arti: "Yang Maha Tunggal" },
  { ar: "الصَّمَدُ", latin: "As-Shamad", arti: "Yang Maha Dibutuhkan" },
  { ar: "الْقَادِرُ", latin: "Al-Qadir", arti: "Yang Maha Menentukan" },
  { ar: "الْمُقْتَدِرُ", latin: "Al-Muqtadir", arti: "Yang Maha Berkuasa" },
  { ar: "الْمُقَدِّمُ", latin: "Al-Muqaddim", arti: "Yang Maha Mendahulukan" },
  { ar: "الْمُؤَخِّرُ", latin: "Al-Mu'akhkhir", arti: "Yang Maha Mengakhirkan" },
  { ar: "الْأَوَّلُ", latin: "Al-Awwal", arti: "Yang Maha Awal" },
  { ar: "الْآخِرُ", latin: "Al-Akhir", arti: "Yang Maha Akhir" },
  { ar: "الظَّاهِرُ", latin: "Azh-Zhahir", arti: "Yang Maha Nyata" },
  { ar: "الْبَاطِنُ", latin: "Al-Bathin", arti: "Yang Maha Ghaib" },
  { ar: "الْوَالِي", latin: "Al-Wali", arti: "Yang Maha Memerintah" },
  { ar: "الْمُتَعَالِي", latin: "Al-Muta'ali", arti: "Yang Maha Tinggi" },
  { ar: "الْبَرُّ", latin: "Al-Barr", arti: "Yang Maha Penderma" },
  { ar: "التَّوَّابُ", latin: "At-Tawwab", arti: "Yang Maha Penerima Taubat" },
  { ar: "الْمُنْتَقِمُ", latin: "Al-Muntaqim", arti: "Yang Maha Pemberi Balasan" },
  { ar: "الْعَفُوُّ", latin: "Al-'Afuww", arti: "Yang Maha Pemaaf" },
  { ar: "الرَّؤُوفُ", latin: "Ar-Ra'uf", arti: "Yang Maha Pengasih" },
  { ar: "مَالِكُ الْمُلْكِ", latin: "Malikul-Mulk", arti: "Penguasa Kerajaan" },
  {
    ar: "ذُو الْجَلَالِ وَالْإِكْرَامِ",
    latin: "Dzul-Jalali wal-Ikram",
    arti: "Pemilik Kebesaran dan Kemuliaan",
  },
  { ar: "الْمُقْسِطُ", latin: "Al-Muqsith", arti: "Yang Maha Adil" },
  { ar: "الْجَامِعُ", latin: "Al-Jami'", arti: "Yang Maha Mengumpulkan" },
  { ar: "الْغَنِيُّ", latin: "Al-Ghaniyy", arti: "Yang Maha Kaya" },
  { ar: "الْمُغْنِي", latin: "Al-Mughni", arti: "Yang Maha Pemberi Kekayaan" },
  { ar: "الْمَانِعُ", latin: "Al-Mani'", arti: "Yang Maha Mencegah" },
  { ar: "الضَّارُّ", latin: "Adh-Dharr", arti: "Yang Maha Pemberi Derita" },
  { ar: "النَّافِعُ", latin: "An-Nafi'", arti: "Yang Maha Pemberi Manfaat" },
  { ar: "النُّورُ", latin: "An-Nur", arti: "Yang Maha Bercahaya" },
  { ar: "الْهَادِي", latin: "Al-Hadi", arti: "Yang Maha Pemberi Petunjuk" },
  { ar: "الْبَدِيعُ", latin: "Al-Badi'", arti: "Yang Maha Pencipta Tiada Banding" },
  { ar: "الْبَاقِي", latin: "Al-Baqi", arti: "Yang Maha Kekal" },
  { ar: "الْوَارِثُ", latin: "Al-Warits", arti: "Yang Maha Mewarisi" },
  { ar: "الرَّشِيدُ", latin: "Ar-Rasyid", arti: "Yang Maha Pandai" },
  { ar: "الصَّبُورُ", latin: "As-Shabur", arti: "Yang Maha Sabar" },
];

export default { DOA, NIAT, DZIKIR, SHOLAWAT, ASMAUL_HUSNA };
