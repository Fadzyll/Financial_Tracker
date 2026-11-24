import type { Locale } from "./dictionaries";

type Section = { title: string; body: string[] };

/** Privacy policy text. Keep both languages in sync when editing. */
export const PRIVACY: Record<Locale, { title: string; updated: string; intro: string; sections: Section[] }> = {
  en: {
    title: "Privacy policy",
    updated: "Last updated: 24 November 2026",
    intro:
      "KiraDuit is a personal money tracker. You type in your own numbers; we never connect to your bank. This page explains what we store and what you control.",
    sections: [
      {
        title: "What we store",
        body: [
          "Your email address and the display name you choose, to give you an account.",
          "What you enter: account names and their bank/provider (e.g. “Maybank Savings”), balances, transactions, categories, notes and savings goals.",
          "Your language and light/dark preference, saved as small cookies in your browser.",
        ],
      },
      {
        title: "What we never store",
        body: [
          "Bank account numbers, card numbers, IC numbers, or your online banking username and password.",
          "KiraDuit cannot move money and has no access to your bank.",
        ],
      },
      {
        title: "Who can see your data",
        body: [
          "Only you. Database security rules make every record private to the account that created it — other users can't read or change it.",
          "The developer can technically access the database to keep the service running, but does not browse personal records and never sells or shares your data.",
        ],
      },
      {
        title: "Where your data is kept",
        body: [
          "Your data and login are stored with Supabase (database and authentication). The website is hosted on Vercel. Both use encrypted connections (HTTPS).",
        ],
      },
      {
        title: "Emails and cookies",
        body: [
          "We only email you to confirm your account or reset your password. No newsletters or marketing.",
          "Cookies are only used to keep you logged in and remember your language and theme. No advertising or tracking cookies.",
        ],
      },
      {
        title: "Your control",
        body: [
          "Download all your transactions any time: Settings → Your data → Download (CSV).",
          "Delete your account and everything in it permanently: Settings → Delete account. This cannot be undone.",
        ],
      },
      {
        title: "Questions",
        body: ["Contact the developer through the KiraDuit support page."],
      },
    ],
  },
  ms: {
    title: "Dasar privasi",
    updated: "Kemas kini terakhir: 24 November 2026",
    intro:
      "KiraDuit ialah aplikasi penjejak kewangan peribadi. Anda masukkan angka sendiri; kami tidak sekali-kali berhubung dengan bank anda. Halaman ini menerangkan apa yang kami simpan dan apa yang anda kawal.",
    sections: [
      {
        title: "Apa yang kami simpan",
        body: [
          "Alamat e-mel dan nama paparan pilihan anda, untuk membuat akaun.",
          "Apa yang anda masukkan: nama akaun dan bank/penyedia (cth. “Maybank Simpanan”), baki, transaksi, kategori, catatan dan sasaran simpanan.",
          "Pilihan bahasa dan mod cerah/gelap, disimpan sebagai kuki kecil dalam pelayar anda.",
        ],
      },
      {
        title: "Apa yang kami tidak sekali-kali simpan",
        body: [
          "Nombor akaun bank, nombor kad, nombor IC, atau nama pengguna dan kata laluan perbankan dalam talian anda.",
          "KiraDuit tidak boleh memindahkan wang dan tiada akses kepada bank anda.",
        ],
      },
      {
        title: "Siapa boleh lihat data anda",
        body: [
          "Hanya anda. Peraturan keselamatan pangkalan data menjadikan setiap rekod peribadi kepada akaun yang membuatnya — pengguna lain tidak boleh membaca atau mengubahnya.",
          "Pembangun secara teknikal boleh mengakses pangkalan data untuk menyelenggara perkhidmatan, tetapi tidak melihat rekod peribadi dan tidak sekali-kali menjual atau berkongsi data anda.",
        ],
      },
      {
        title: "Di mana data anda disimpan",
        body: [
          "Data dan log masuk anda disimpan dengan Supabase (pangkalan data dan pengesahan). Laman web dihoskan di Vercel. Kedua-duanya menggunakan sambungan disulitkan (HTTPS).",
        ],
      },
      {
        title: "E-mel dan kuki",
        body: [
          "Kami hanya menghantar e-mel untuk mengesahkan akaun atau set semula kata laluan. Tiada surat berita atau pemasaran.",
          "Kuki hanya digunakan untuk kekalkan log masuk dan ingat bahasa serta tema anda. Tiada kuki pengiklanan atau penjejakan.",
        ],
      },
      {
        title: "Kawalan anda",
        body: [
          "Muat turun semua transaksi anda bila-bila masa: Tetapan → Data anda → Muat turun (CSV).",
          "Padam akaun dan semua kandungannya secara kekal: Tetapan → Padam akaun. Tindakan ini tidak boleh dibatalkan.",
        ],
      },
      {
        title: "Soalan",
        body: ["Hubungi pembangun melalui halaman sokongan KiraDuit."],
      },
    ],
  },
};
