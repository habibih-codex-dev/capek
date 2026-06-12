/**
 * lib/uploader.js — Upload media ke hosting publik (untuk .tourl)
 * ------------------------------------------------------------------
 * Memakai endpoint publik gratis. Jika satu mati, ganti fungsi di sini saja.
 * Memakai global fetch & FormData (Node.js >= 18).
 */

/** Upload ke Catbox (https://catbox.moe). Mengembalikan URL string. */
export async function uploadToCatbox(buffer, filename = "file.bin") {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append(
    "fileToUpload",
    new Blob([buffer]),
    filename
  );
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });
  const text = (await res.text()).trim();
  if (!text.startsWith("http")) throw new Error("Upload gagal: " + text.slice(0, 100));
  return text;
}

/** Upload utama dengan fallback. */
export async function upload(buffer, filename = "file.bin") {
  return await uploadToCatbox(buffer, filename);
}

export default { upload, uploadToCatbox };
