import { extractSchedule } from "./extractor/extractSchedule.js";

const fileInput = document.getElementById("icsFile");
const scanBtn = document.getElementById("scanBtn");
const uploadBtn = document.getElementById("uploadBtn");
const linkBtn = document.getElementById("linkBtn");
const shareableLink = document.getElementById("shareableLink");
const shareUrlSpan = document.getElementById("shareUrl");
const feedback = document.getElementById("feedback");
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

let currentShareUrl = null;

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Reset styles
  shareableLink.classList.add(
    "bg-slate-100",
    "text-slate-400",
    "border-slate-200",
    "cursor-not-allowed"
  );
  shareableLink.classList.remove(
    "bg-sky-50",
    "text-sky-700",
    "border-sky-200",
    "cursor-pointer",
    "hover:bg-sky-100"
  );
  copyBtn.disabled = true;
  copyBtn.classList.add("text-slate-400", "cursor-not-allowed");
  copyBtn.classList.remove("text-sky-600", "hover:underline", "cursor-pointer");
  shareUrlSpan.textContent = "No link yet";
  copiedMsg.classList.add("hidden");

  uploadBtn.disabled = true;
  linkBtn.disabled = true;
  linkBtn.className =
    "mb-3 w-full rounded-md bg-slate-100 px-6 py-3 text-sm font-medium text-slate-400 text-center transition cursor-not-allowed";
  feedback.textContent = "";
  uploadBtn.textContent = "Uploading...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("school_location", "University of Virginia");

  try {
    const res = await fetch("http://localhost:8000/api/sessions", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.short_id) {
      currentShareUrl = `http://localhost:5173/view/${data.short_id}`;
      shareUrlSpan.textContent = currentShareUrl;

      // Enable "See your map" button
      linkBtn.disabled = false;
      linkBtn.className =
        "mb-3 w-full rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white text-center transition hover:bg-slate-800 cursor-pointer";

      // Enable link styles
      shareableLink.classList.remove(
        "bg-slate-100",
        "text-slate-400",
        "border-slate-200",
        "cursor-not-allowed"
      );
      shareableLink.classList.add(
        "bg-sky-50",
        "text-sky-700",
        "border-sky-200",
        "cursor-pointer",
        "hover:bg-sky-100"
      );

      // Enable copy button
      copyBtn.disabled = false;
      copyBtn.classList.remove("text-slate-400", "cursor-not-allowed");
      copyBtn.classList.add(
        "text-sky-600",
        "hover:underline",
        "cursor-pointer"
      );

      feedback.textContent = `Selected: ${file.name}`;
    } else {
      feedback.textContent = data.error || "Something went wrong.";
      feedback.classList.replace("text-slate-500", "text-red-600");
    }
  } catch {
    feedback.textContent = "Could not connect to the server.";
    feedback.classList.replace("text-slate-500", "text-red-600");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload .ics";
  }
});

linkBtn.addEventListener("click", () => {
  if (currentShareUrl) window.open(currentShareUrl, "_blank");
});

copyBtn.addEventListener("click", () => {
  const text = shareUrlSpan.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copiedMsg.classList.remove("hidden");
    copyBtn.classList.add("hidden");
    setTimeout(() => {
      copiedMsg.classList.add("hidden");
      copyBtn.classList.remove("hidden");
    }, 2000);
  });
});
