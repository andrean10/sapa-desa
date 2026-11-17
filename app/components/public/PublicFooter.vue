<script setup lang="ts">
import {
  APP_NAME,
  PUBLIC_BRAND_NAME,
  REGIONAL_OFFICE_NAME,
} from "~~/shared/config/app";
import { NAVIGASI_PUBLIK, TEKS_UMUM } from "~~/shared/config/teks";

const tahunSekarang = new Date().getFullYear();
</script>

<template>
  <footer class="bg-primary text-primary-foreground">
    <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:gap-16">
        <div class="max-w-md">
          <NuxtLink
            class="group inline-flex items-center gap-3 text-primary-foreground no-underline"
            to="/"
            :aria-label="PUBLIC_BRAND_NAME"
          >
            <img
              class="size-16 shrink-0 object-contain transition duration-200 group-hover:-translate-y-0.5"
              src="/images/logo.webp"
              alt=""
              width="64"
              height="64"
            />
            <span
              class="flex max-w-76 flex-col text-xs font-black leading-[1.2] tracking-[0.08em] sm:text-sm sm:leading-[1.22]"
            >
              <span>SISTEM PELAPORAN</span>
              <span>PEMANTAUAN AKTIFITAS</span>
              <span>DESA BINAAN IMIGRASI</span>
            </span>
          </NuxtLink>
          <p
            class="mt-7 text-2xl font-extrabold leading-tight text-white sm:text-3xl"
          >
            Layanan pengaduan keimigrasian untuk masyarakat Riau.
          </p>
          <p class="mt-5 max-w-sm text-sm leading-6 text-white/65">
            {{ REGIONAL_OFFICE_NAME }}
          </p>
        </div>
        <div>
          <p
            class="text-xs font-extrabold uppercase tracking-[.18em] text-accent"
          >
            Jelajahi
          </p>
          <nav class="mt-5 grid gap-3" aria-label="Navigasi footer">
            <NuxtLink
              v-for="item in NAVIGASI_PUBLIK"
              :key="item.href"
              class="w-fit text-sm font-bold text-white/75 underline-offset-4 transition hover:text-white hover:underline"
              :to="item.href"
              >{{ item.label }}</NuxtLink
            >
          </nav>
        </div>
        <div>
          <p
            class="text-xs font-extrabold uppercase tracking-[.18em] text-accent"
          >
            Untuk petugas
          </p>
          <NuxtLink
            class="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 text-sm font-bold text-white no-underline transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
            to="/masuk"
            >{{ TEKS_UMUM.identitasPetugas
            }}<span class="ml-3 text-lg" aria-hidden="true">→</span></NuxtLink
          >
        </div>
      </div>
      <div
        class="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/50"
      >
        <p>© {{ tahunSekarang }} - {{ APP_NAME }}</p>
        <p>Riau · Indonesia</p>
      </div>
    </div>
  </footer>
</template>
