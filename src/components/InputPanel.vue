<template>
  <div class="input-panel fade-in">

    <!-- ═══ PAGE HEADER BAR ═══════════════════════════════════════ -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Form Input Simulasi</h1>
        <p class="page-subtitle">Isi parameter lapangan untuk menghitung arus kas dan kelayakan investasi</p>
      </div>
      <div class="page-header-right">
        <div class="preset-group">
          <button
            v-for="p in presets" :key="p.key"
            :id="`btn-preset-${p.key}`"
            class="btn btn-sm btn-case"
            :class="`btn-case-${p.type}`"
            @click="loadPreset(p)"
          >{{ p.label }}</button>
          <button id="btn-reset" class="btn btn-reset" @click="resetForm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MAIN LAYOUT: Form + Sticky Sidebar ═══════════════════ -->
    <div class="main-layout">

      <!-- ── FORM AREA ────────────────────────────────────────── -->
      <div class="form-area">
        <div class="form-grid">

          <!-- ══ LEFT COLUMN ════════════════════════════════════ -->
          <div class="form-col">

            <!-- 1. Durasi Proyek -->
            <div class="card">
              <div class="card-title">Durasi Proyek</div>
              <div class="form-group">
                <label class="form-label" for="input-jangka-waktu">
                  Jangka Waktu Proyek
                  <div class="tooltip-container">
                    <span class="help-icon">?</span>
                    <span class="tooltip-box">Masa aktif operasi lapangan minyak. Di Indonesia, masa kontrak biasanya berkisar 10–25 tahun.</span>
                  </div>
                </label>
                <div class="input-unit-wrap">
                  <input
                    id="input-jangka-waktu"
                    v-model.number="form.jangkaWaktu"
                    type="number" min="1" max="25"
                    class="form-input"
                    :class="{ error: errors.jangkaWaktu }"
                    placeholder="10"
                  />
                  <span class="input-unit">tahun</span>
                </div>
                <span v-if="errors.jangkaWaktu" class="form-error">{{ errors.jangkaWaktu }}</span>
              </div>
            </div>

            <!-- 2. Modal Awal / Investasi -->
            <div class="card">
              <div class="card-title">Modal Awal (Investasi)</div>
              <div class="investasi-grid">
                <div class="form-group">
                  <label class="form-label" for="input-capital">
                    Capital (Belanja Modal)
                    <div class="tooltip-container">
                      <span class="help-icon">?</span>
                      <span class="tooltip-box">Biaya untuk aset fisik tetap seperti tangki, pipa, alat pengeboran. Nilainya menyusut tiap tahun (dapat didepresiasi).</span>
                    </div>
                  </label>
                  <div class="input-unit-wrap">
                    <span class="input-prefix">Rp</span>
                    <input id="input-capital" v-model.number="form.capital" type="number" min="0" class="form-input" :class="{ error: errors.capital }" placeholder="195.000.000" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="input-non-capital">
                    Non-Capital
                    <div class="tooltip-container">
                      <span class="help-icon">?</span>
                      <span class="tooltip-box">Biaya habis pakai yang tidak memiliki wujud fisik tetap, misalnya biaya survei geologi atau sewa alat. Tidak didepresiasi.</span>
                    </div>
                  </label>
                  <div class="input-unit-wrap">
                    <span class="input-prefix">Rp</span>
                    <input id="input-non-capital" v-model.number="form.nonCapital" type="number" min="0" class="form-input" placeholder="120.000.000" />
                  </div>
                </div>
              </div>
              <div class="total-row">
                <span class="total-row-label">Total Investasi Awal (Tahun 0)</span>
                <span class="total-row-value">{{ formatMoney(totalInvestasi) }}</span>
              </div>
            </div>

            <!-- 3. Harga Minyak -->
            <div class="card">
              <div class="card-title">Harga Jual Minyak Bumi</div>
              <div class="form-group">
                <label class="form-label" for="input-harga-minyak">
                  Harga Dasar per Barel
                  <div class="tooltip-container">
                    <span class="help-icon">?</span>
                    <span class="tooltip-box">Estimasi harga jual minyak bumi per barel. Hitungan akan mengalikan juta barel (Mbbl) dengan harga per barel (Rp/bbl).</span>
                  </div>
                </label>
                <div class="input-unit-wrap">
                  <span class="input-prefix">Rp</span>
                  <input id="input-harga-minyak" v-model.number="form.hargaMinyak" type="number" min="0" class="form-input" :class="{ error: errors.hargaMinyak }" placeholder="480.000" />
                  <span class="input-unit">/bbl</span>
                </div>
                <span v-if="errors.hargaMinyak" class="form-error">{{ errors.hargaMinyak }}</span>
              </div>

              <!-- Escalation Toggle -->
              <hr class="card-divider" />
              <div class="toggle-section">
                <label class="toggle-wrapper" @click="toggleEscalation">
                  <div class="toggle" :class="{ active: useEscalation }"></div>
                  <span class="toggle-label">Kenaikan harga per tahun (Escalation)</span>
                </label>
                <div v-if="useEscalation" class="toggle-sub-field">
                  <div class="input-unit-wrap">
                    <input id="input-harga-escalation" v-model.number="form.hargaEscalation" type="number" min="0" max="50" class="form-input" placeholder="3" />
                    <span class="input-unit">% / tahun</span>
                  </div>
                  <span class="form-hint">Harga minyak naik otomatis setiap tahun mengikuti inflasi pasar global.</span>
                </div>
              </div>
            </div>

            <!-- 4. Opex -->
            <div class="card">
              <div class="card-title">Biaya Operasional (OPEX)</div>
              <div class="form-group">
                <label class="form-label" for="input-opex">
                  Opex Dasar Tahunan
                  <div class="tooltip-container">
                    <span class="help-icon">?</span>
                    <span class="tooltip-box">Operating Expenditure: Biaya rutin tahunan untuk menyedot, merawat sumur, dan menggaji tim di lapangan.</span>
                  </div>
                </label>
                <div class="input-unit-wrap">
                  <span class="input-prefix">Rp</span>
                  <input id="input-opex" v-model.number="form.opex" type="number" min="0" class="form-input" placeholder="2.700.000" />
                  <span class="input-unit">/ tahun</span>
                </div>
              </div>

              <!-- Opex Naik Toggle -->
              <hr class="card-divider" />
              <div class="toggle-section">
                <label class="toggle-wrapper" @click="toggleOpexNaik">
                  <div class="toggle" :class="{ active: useOpexNaik }"></div>
                  <span class="toggle-label">Asumsi kenaikan OPEX per tahun</span>
                </label>
                <div v-if="useOpexNaik" class="toggle-sub-field opex-naik-grid">
                  <div class="form-group">
                    <label class="form-label">Tingkat Kenaikan</label>
                    <div class="input-unit-wrap">
                      <input id="input-opex-naik-persen" v-model.number="form.opexNaikPersen" type="number" min="0" max="50" class="form-input" placeholder="2.5" />
                      <span class="input-unit">% / tahun</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Mulai Tahun ke-</label>
                    <input id="input-opex-naik-mulai" v-model.number="form.opexNaikMulaiTahun" type="number" min="2" :max="form.jangkaWaktu" class="form-input" placeholder="4" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. Pajak -->
            <div class="card">
              <div class="card-title">Bagian Pajak Pemerintah</div>
              <div class="form-group">
                <label class="form-label" for="input-pajak">
                  Tax Rate (Tarif Pajak)
                  <div class="tooltip-container">
                    <span class="help-icon">?</span>
                    <span class="tooltip-box">Persentase keuntungan bersih yang disetor ke kas negara. Pajak dihitung dari keuntungan kotor setelah dipotong Opex dan Depresiasi.</span>
                  </div>
                </label>
                <div class="input-unit-wrap">
                  <input id="input-pajak" v-model.number="form.pajakRate" type="number" min="0" max="100" class="form-input" :class="{ error: errors.pajakRate }" placeholder="51" />
                  <span class="input-unit">%</span>
                </div>
                <span v-if="errors.pajakRate" class="form-error">{{ errors.pajakRate }}</span>
              </div>
            </div>

          </div><!-- /LEFT COLUMN -->

          <!-- ══ RIGHT COLUMN ═══════════════════════════════════ -->
          <div class="form-col">

            <!-- 6. Data Produksi -->
            <div class="card">
              <div class="card-title">Laju Produksi Minyak</div>

              <!-- Mode Segmented -->
              <div class="mode-btn-group">
                <button id="btn-mode-manual" class="mode-btn" :class="{ active: !useDecline }" @click="setMode(false)">Manual</button>
                <button id="btn-mode-otomatis" class="mode-btn" :class="{ active: useDecline }" @click="setMode(true)">Decline Otomatis</button>
              </div>

              <!-- Decline settings -->
              <div v-if="useDecline" class="decline-header">
                <div class="form-group flex-1">
                  <label class="form-label">
                    Mulai Decline Tahun ke-
                    <div class="tooltip-container">
                      <span class="help-icon">?</span>
                      <span class="tooltip-box">Minyak di bumi terbatas. Tekanan sumur akan melemah alami. Pilih di tahun ke berapa produksi mulai menyusut otomatis.</span>
                    </div>
                  </label>
                  <div class="slider-row">
                    <input type="range" min="1" :max="form.jangkaWaktu" v-model.number="form.mulaiDecline" class="range-slider" id="slider-mulai-decline" />
                    <span class="slider-value">{{ form.mulaiDecline }}</span>
                  </div>
                  <span class="form-hint">Tahun 1–{{ form.mulaiDecline - 1 }} diisi manual, selanjutnya berkurang otomatis.</span>
                </div>
                <div class="form-group" style="width: 130px; flex-shrink: 0">
                  <label class="form-label">Laju Turun</label>
                  <div class="input-unit-wrap">
                    <input id="input-decline-rate" v-model.number="form.declineRate" type="number" min="0" max="99" class="form-input" :class="{ error: errors.declineRate }" placeholder="3" />
                    <span class="input-unit">% / thn</span>
                  </div>
                </div>
              </div>

              <!-- Manual Production Rows -->
              <div class="produksi-manual">
                <div v-for="t in manualYears" :key="t" class="produksi-row">
                  <label class="produksi-label">Tahun {{ t }}</label>
                  <div class="input-unit-wrap" style="flex: 1">
                    <input
                      :id="`input-prod-${t}`"
                      v-model.number="form.produksiManual[t - 1]"
                      type="number" min="0"
                      class="form-input form-input-sm"
                      :placeholder="`Produksi tahun ${t}`"
                    />
                    <span class="input-unit">Mbbl</span>
                  </div>
                </div>
              </div>

              <div v-if="useDecline && autoYears.length > 0" class="auto-decline-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Tahun {{ form.mulaiDecline }}–{{ form.jangkaWaktu }}: Dihitung otomatis, menyusut {{ form.declineRate }}% per tahun.
              </div>

              <!-- Production Preview Table -->
              <hr class="card-divider" />
              <ProductionTable :production="previewProduction" :jangkaWaktu="form.jangkaWaktu" />
              <span v-if="errors.produksi" class="form-error" style="margin-top: 8px; display: block;">{{ errors.produksi }}</span>
            </div>

            <!-- 7. Metode Depresiasi -->
            <div class="card">
              <div class="card-title">Strategi Depresiasi</div>
              <div class="form-group">
                <label class="form-label" for="select-metode-dep">
                  Pilih Metode Penyusutan
                  <div class="tooltip-container">
                    <span class="help-icon">?</span>
                    <span class="tooltip-box">Metode memotong nilai alat-alat berat untuk memotong pajak. Metode cepat (Double Declining) menguntungkan di awal agar cepat balik modal.</span>
                  </div>
                </label>
                <select id="select-metode-dep" v-model="form.metodeDep" class="form-input">
                  <option v-for="(label, val) in DEPRECIATION_LABELS" :key="val" :value="val">{{ label }}</option>
                </select>
              </div>

              <div v-if="form.metodeDep === 'unitOfProduction'" class="form-group" style="margin-top: var(--space-3)">
                <label class="form-label" for="input-reserve-total">Cadangan Minyak Total (Reserve)</label>
                <div class="input-unit-wrap">
                  <input id="input-reserve-total" v-model.number="form.reserveTotal" type="number" min="0" class="form-input" :class="{ error: errors.reserveTotal }" placeholder="1000" />
                  <span class="input-unit">Mbbl</span>
                </div>
                <span v-if="errors.reserveTotal" class="form-error">{{ errors.reserveTotal }}</span>
              </div>

              <hr class="card-divider" />
              <DepreciationTable v-if="previewDepreciation.length > 0" :rows="previewDepreciation" :compact="true" />
            </div>

          </div><!-- /RIGHT COLUMN -->
        </div><!-- /form-grid -->

        <!-- ── SIMULASI BUTTON ──────────────────────────────────── -->
        <button id="btn-hitung" class="btn-simulasi" @click="handleCalculate">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Jalankan Simulasi
        </button>

      </div><!-- /form-area -->

      <!-- ── STICKY SUMMARY SIDEBAR ──────────────────────────── -->
      <aside class="summary-sidebar">
        <div class="summary-header">
          <span class="summary-title">Ringkasan Input</span>
          <span class="summary-live-dot"></span>
        </div>

        <div class="summary-items">
          <div class="summary-item">
            <span class="summary-item-label">Jangka Waktu</span>
            <span class="summary-item-value">{{ form.jangkaWaktu || '—' }} <small>tahun</small></span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Total Investasi</span>
            <span class="summary-item-value highlight">{{ formatMoneyShort(totalInvestasi) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Capital</span>
            <span class="summary-item-value">{{ formatMoneyShort(form.capital) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Non-Capital</span>
            <span class="summary-item-value">{{ formatMoneyShort(form.nonCapital) }}</span>
          </div>
          <hr class="summary-divider" />
          <div class="summary-item">
            <span class="summary-item-label">Harga Minyak</span>
            <span class="summary-item-value">{{ formatMoneyShort(form.hargaMinyak) }} <small>/bbl</small></span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">OPEX / tahun</span>
            <span class="summary-item-value">{{ formatMoneyShort(form.opex) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Pajak</span>
            <span class="summary-item-value">{{ form.pajakRate || '—' }} <small>%</small></span>
          </div>
          <hr class="summary-divider" />
          <div class="summary-item">
            <span class="summary-item-label">Total Produksi</span>
            <span class="summary-item-value highlight">{{ totalProduksiPreview.toLocaleString('id-ID', { maximumFractionDigits: 1 }) }} <small>Mbbl</small></span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Metode Depresiasi</span>
            <span class="summary-item-value">{{ DEPRECIATION_LABELS[form.metodeDep] || '—' }}</span>
          </div>
          <div class="summary-item" v-if="useEscalation">
            <span class="summary-item-label">Eskalasi Harga</span>
            <span class="summary-item-value">{{ form.hargaEscalation }} <small>% / thn</small></span>
          </div>
          <div class="summary-item" v-if="useOpexNaik">
            <span class="summary-item-label">Kenaikan OPEX</span>
            <span class="summary-item-value">{{ form.opexNaikPersen }} <small>% / thn</small></span>
          </div>
        </div>

        <button class="btn-simulasi-mini" @click="handleCalculate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Simulasi
        </button>
      </aside>

    </div><!-- /main-layout -->

    <!-- ── SAVE DIALOG ────────────────────────────────────────── -->
    <div v-if="showSaveDialog" class="modal-overlay" @click.self="showSaveDialog = false">
      <div class="modal-box">
        <h3 class="modal-title">Simpan Simulasi Baru</h3>
        <div class="form-group">
          <label class="form-label">Nama Skenario Lapangan</label>
          <input id="input-nama-skenario" v-model="saveName" type="text" class="form-input" placeholder="cth: Lapangan RISKI - Strategi Cepat" @keyup.enter="confirmSave" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showSaveDialog = false">Batal</button>
          <button class="btn btn-primary" @click="confirmSave" :disabled="!saveName.trim()">Simpan Sekarang</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ProductionTable from "./ProductionTable.vue";
import DepreciationTable from "./DepreciationTable.vue";
import { computeProduction } from "../composables/useCalculator.js";
import { computeDepreciation, DEPRECIATION_LABELS } from "../composables/useDepreciation.js";
import { saveScenario } from "../composables/useStorage.js";
import { dummyScenarios, defaultInput } from "../data/dummyScenarios.js";

const emit = defineEmits(["calculate", "saved"]);

// ── State ──────────────────────────────────────────
const form = ref({ ...defaultInput() });
const errors = ref({});
const showSaveDialog = ref(false);
const saveName = ref("");
const useEscalation = ref(false);
const useOpexNaik = ref(false);
const useDecline = ref(false);

const presets = dummyScenarios;

// ── Computed ────────────────────────────────────────
const totalInvestasi = computed(() => (form.value.capital || 0) + (form.value.nonCapital || 0));

const manualYears = computed(() => {
  const mulai = form.value.mulaiDecline || form.value.jangkaWaktu + 1;
  return Array.from({ length: Math.min(mulai - 1, form.value.jangkaWaktu) }, (_, i) => i + 1);
});

const autoYears = computed(() => {
  const mulai = form.value.mulaiDecline || null;
  if (!mulai) return [];
  return Array.from({ length: form.value.jangkaWaktu - mulai + 1 }, (_, i) => mulai + i);
});

const previewProduction = computed(() => computeProduction(form.value));

const totalProduksiPreview = computed(() => previewProduction.value.reduce((a, b) => a + b, 0));

const previewDepreciation = computed(() => {
  if (form.value.capital <= 0) return [];
  return computeDepreciation(form.value, previewProduction.value);
});

// Ensure produksiManual array size matches jangkaWaktu
watch(
  () => form.value.jangkaWaktu,
  (newN) => {
    const arr = form.value.produksiManual;
    if (arr.length < newN) {
      form.value.produksiManual = [...arr, ...Array(newN - arr.length).fill(0)];
    } else {
      form.value.produksiManual = arr.slice(0, newN);
    }
  },
);

// ── Methods ─────────────────────────────────────────
function formatMoney(val) {
  if (!val && val !== 0) return "Rp 0";
  return `Rp ${Number(val).toLocaleString("id-ID")}`;
}

function formatMoneyShort(val) {
  if (!val && val !== 0) return "—";
  const n = Number(val);
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function toggleEscalation() {
  useEscalation.value = !useEscalation.value;
  if (!useEscalation.value) form.value.hargaEscalation = 0;
}

function toggleOpexNaik() {
  useOpexNaik.value = !useOpexNaik.value;
  if (!useOpexNaik.value) {
    form.value.opexNaikPersen = 0;
    form.value.opexNaikMulaiTahun = null;
  }
}

function setMode(otomatis) {
  useDecline.value = otomatis;
  if (!otomatis) {
    form.value.mulaiDecline = null;
    form.value.declineRate = 0;
  } else {
    form.value.mulaiDecline = form.value.mulaiDecline || Math.min(5, form.value.jangkaWaktu);
    form.value.declineRate = form.value.declineRate || 3;
  }
}

function loadPreset(preset) {
  form.value = {
    ...defaultInput(),
    ...preset,
    produksiManual: [...preset.produksiManual, ...Array(Math.max(0, preset.jangkaWaktu - preset.produksiManual.length)).fill(0)],
  };
  useEscalation.value = (preset.hargaEscalation || 0) > 0;
  useOpexNaik.value = (preset.opexNaikPersen || 0) > 0;
  useDecline.value = (preset.mulaiDecline || 0) > 0;
  errors.value = {};
}

function resetForm() {
  form.value = { ...defaultInput() };
  useEscalation.value = false;
  useOpexNaik.value = false;
  useDecline.value = false;
  errors.value = {};
}

function handleCalculate() {
  const errs = {};
  if (!form.value.jangkaWaktu || form.value.jangkaWaktu < 1 || form.value.jangkaWaktu > 25) errs.jangkaWaktu = "Jangka waktu harus antara 1–25 tahun";
  if (!form.value.hargaMinyak || form.value.hargaMinyak <= 0) errs.hargaMinyak = "Harga minyak harus lebih dari 0";
  if (form.value.declineRate >= 100) errs.declineRate = "Decline rate maksimal 99%";
  if (form.value.pajakRate < 0 || form.value.pajakRate > 100) errs.pajakRate = "Pajak harus antara 0–100%";
  if (form.value.metodeDep === "unitOfProduction" && (!form.value.reserveTotal || form.value.reserveTotal <= 0)) errs.reserveTotal = "Reserve Total harus diisi untuk metode ini";
  const totalProd = previewProduction.value.reduce((a, b) => a + b, 0);
  if (totalProd <= 0) errs.produksi = "Data produksi tidak boleh semua nol";

  errors.value = errs;
  if (Object.keys(errs).length > 0) return;

  emit("calculate", { ...form.value });
}

function openSaveDialog() {
  saveName.value = form.value.nama || "";
  showSaveDialog.value = true;
}

function confirmSave() {
  if (!saveName.value.trim()) return;
  form.value.nama = saveName.value.trim();
  showSaveDialog.value = false;
  emit("saved", saveName.value.trim());
}
</script>

<style scoped>

/* ── Page Layout ──────────────────────────────────── */
.input-panel {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
  font-weight: 400;
}

.page-header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.preset-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.preset-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: var(--space-5);
  align-items: start;
}

/* Form Area */
.form-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Input with unit */
.input-unit-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.input-unit-wrap .form-input {
  padding-right: 52px;
}

.input-unit-wrap .input-prefix + .form-input {
  padding-left: 32px;
}

.input-unit {
  position: absolute;
  right: 12px;
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
  white-space: nowrap;
}

.form-input-sm {
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: 14px;
}

/* Investasi Grid */
.investasi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* Total Row */
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--border-thin);
}

.total-row-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.total-row-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-primary);
}

/* Toggle Section */
.toggle-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.toggle-sub-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-left: 52px; /* aligned with toggle width */
}

.opex-naik-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* Mode segmented buttons */
.mode-btn-group {
  display: flex;
  gap: 0;
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: fit-content;
  margin-bottom: var(--space-4);
}

.mode-btn {
  padding: 7px 16px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-btn:not(:last-child) {
  border-right: var(--border-thin);
}

.mode-btn.active {
  background: var(--accent-primary);
  color: #fff;
  font-weight: 600;
}

.mode-btn:not(.active):hover {
  background: var(--bg-input);
  color: var(--text-primary);
}

/* Decline header */
.decline-header {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  align-items: flex-end;
}

.flex-1 { flex: 1; }

.slider-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.slider-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
  min-width: 28px;
  text-align: center;
}

/* Produksi Manual */
.produksi-manual {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  max-height: 220px;
  overflow-y: auto;
  padding-right: var(--space-1);
}

.produksi-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.produksi-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  min-width: 70px;
  flex-shrink: 0;
}

/* Auto decline hint */
.auto-decline-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-secondary);
  background: var(--accent-secondary-light);
  border: 1px solid rgba(13, 155, 108, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
}

/* Case preset buttons */
.btn-case {
  font-size: 12px;
  font-weight: 500;
  border: 1.5px solid;
  border-radius: var(--radius-sm);
  padding: 5px 11px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
}

.btn-case-untung {
  color: var(--positive);
  border-color: var(--positive);
}
.btn-case-untung:hover { background: var(--positive-light); }

.btn-case-hybrid {
  color: var(--accent-secondary);
  border-color: var(--accent-secondary);
}
.btn-case-hybrid:hover { background: var(--accent-secondary-light); }

.btn-case-rugi {
  color: var(--negative);
  border-color: var(--negative);
}
.btn-case-rugi:hover { background: var(--negative-light); }

/* Reset button — clearly visible, same height as preset buttons */
.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 5px 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.btn-reset:hover {
  background: var(--negative-light);
  border-color: var(--negative);
  color: var(--negative);
}

/* ── SIMULASI BUTTON (Full Width) ───────────────── */
.btn-simulasi {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: 16px var(--space-6);
  background: var(--accent-primary);
  color: #fff;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: 0.01em;
  box-shadow: 0 2px 8px var(--accent-primary-glow);
}

.btn-simulasi:hover {
  background: var(--accent-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--accent-primary-glow);
}

.btn-simulasi:active {
  transform: translateY(0);
}

/* ── STICKY SUMMARY SIDEBAR ─────────────────────── */
.summary-sidebar {
  position: sticky;
  top: 80px;
  background: var(--bg-card);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: var(--border-thin);
}

.summary-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-section-title);
}

.summary-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--positive);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-2);
}

.summary-item-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  flex-shrink: 0;
}

.summary-item-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

.summary-item-value small {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
}

.summary-item-value.highlight {
  color: var(--accent-primary);
  font-size: 14px;
}

.summary-divider {
  border: none;
  border-top: var(--border-thin);
  margin: 2px 0;
}

.btn-simulasi-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px var(--space-4);
  background: var(--accent-primary);
  color: #fff;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-1);
}

.btn-simulasi-mini:hover {
  background: var(--accent-primary-hover);
  box-shadow: 0 3px 10px var(--accent-primary-glow);
}

/* ── Modal ──────────────────────────────────────── */
.modal-box {
  background: var(--bg-card);
  border: var(--border-thin);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  width: 420px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 1100px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .summary-sidebar {
    position: static;
    order: -1;
  }
  .summary-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  .summary-divider { display: none; }
}

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .investasi-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
  .summary-items { grid-template-columns: 1fr; }
}
</style>
