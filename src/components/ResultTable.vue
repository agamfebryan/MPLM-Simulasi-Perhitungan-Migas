<template>
  <div class="result-table-wrap fade-in">
    <div class="table-header-bar">
      <h2 class="section-title">TABEL ARUS KAS DETAIL (NCF)</h2>
      <div class="table-actions">
        <button id="btn-download-excel" class="btn btn-excel" @click="downloadExcel" :class="{ downloading }">
          <svg v-if="!downloading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/>
            <path d="M21 12a9 9 0 00-9-9"/>
          </svg>
          {{ downloading ? 'Menyiapkan...' : 'Download Excel' }}
        </button>
      </div>
    </div>
    <div class="table-scroll">
      <table class="data-table" id="ncf-table">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Produksi Minyak</th>
            <th>Total Pendapatan</th>
            <th>Modal Capital</th>
            <th>Modal Non-Capital</th>
            <th>Biaya Opex</th>
            <th>Depresiasi (Penyusutan)</th>
            <th>Keuntungan Kena Pajak</th>
            <th>Setoran Pajak</th>
            <th>Arus Kas Bersih (NCF)</th>
            <th>Akumulasi Keuntungan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.tahun"
            :class="{
              'row-zero': row.tahun === 0,
              'row-positive': row.tahun > 0 && row.ncf > 0,
              'row-negative': row.tahun > 0 && row.ncf < 0,
            }"
          >
            <td class="tahun-cell">Thn {{ row.tahun }}</td>
            <td class="monospace">{{ row.produksi !== null ? fmt(row.produksi, 1) + ' Mbbl' : '—' }}</td>
            <td class="monospace" :class="colorClass(row.income)">{{ row.income !== null ? fmtM(row.income) : '—' }}</td>
            <td class="monospace val-amber">{{ row.capital !== null ? fmtM(row.capital) : '—' }}</td>
            <td class="monospace val-amber">{{ row.nonCapital !== null ? fmtM(row.nonCapital) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.opex, true)">{{ row.opex !== null ? fmtM(row.opex) : '—' }}</td>
            <td class="monospace val-cyan">{{ row.Di !== null ? fmtM(row.Di) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.taxableIncome)">{{ row.taxableIncome !== null ? fmtM(row.taxableIncome) : '—' }}</td>
            <td class="monospace" :class="colorClass(row.tax, true)">{{ row.tax !== null ? fmtM(row.tax) : '—' }}</td>
            <td class="monospace" :class="row.ncf >= 0 ? 'val-positive' : 'val-negative'">{{ fmtM(row.ncf) }}</td>
            <td class="monospace" :class="row.cumulativeNcf >= 0 ? 'val-positive' : 'val-negative'">{{ fmtM(row.cumulativeNcf) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="row-total">
            <td>TOTAL SIMULASI</td>
            <td class="monospace">{{ fmt(totalProd, 1) }} Mbbl</td>
            <td class="monospace">{{ fmtM(totalIncome) }}</td>
            <td class="monospace">{{ fmtM(totalCapital) }}</td>
            <td class="monospace">{{ fmtM(totalNonCapital) }}</td>
            <td class="monospace">{{ fmtM(totalOpex) }}</td>
            <td class="monospace">{{ fmtM(totalDi) }}</td>
            <td class="monospace">{{ fmtM(totalTaxable) }}</td>
            <td class="monospace">{{ fmtM(totalTax) }}</td>
            <td class="monospace">{{ fmtM(totalNcf) }}</td>
            <td class="monospace">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { exportToExcel } from '../composables/useExcelExport.js'

const props = defineProps({
  rows:         { type: Array,  default: () => [] },
  indicators:   { type: Object, default: () => ({}) },
  inputData:    { type: Object, default: () => ({}) },
  discountRate: { type: Number, default: 10 },
})

const downloading = ref(false)

const sumNonNull = (key) => props.rows.reduce((a, r) => a + (r[key] !== null ? r[key] : 0), 0)

const totalProd     = computed(() => sumNonNull('produksi'))
const totalIncome   = computed(() => sumNonNull('income'))
const totalCapital  = computed(() => sumNonNull('capital'))
const totalNonCapital = computed(() => sumNonNull('nonCapital'))
const totalOpex     = computed(() => sumNonNull('opex'))
const totalDi       = computed(() => sumNonNull('Di'))
const totalTaxable  = computed(() => sumNonNull('taxableIncome'))
const totalTax      = computed(() => sumNonNull('tax'))
const totalNcf      = computed(() => props.rows.reduce((a, r) => a + (r.ncf || 0), 0))

function fmt(val, dec = 2) {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return Number(val).toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtM(val, dec = 2) {
  if (val === undefined || val === null || isNaN(val)) return '—'
  return `Rp ${fmt(val, dec)}`
}

function colorClass(val, isExpense = false) {
  if (val === null || val === undefined) return ''
  if (isExpense) return val > 0 ? 'val-negative' : ''
  return val >= 0 ? 'val-positive' : 'val-negative'
}

async function downloadExcel() {
  if (downloading.value) return
  downloading.value = true
  // Sedikit delay agar animasi loading terlihat
  await new Promise(r => setTimeout(r, 300))
  try {
    exportToExcel(props.rows, props.indicators, props.inputData, props.discountRate)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.result-table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.table-scroll {
  overflow-x: auto;
  max-height: 480px;
  overflow-y: auto;
}

.tahun-cell {
  text-align: left !important;
  font-weight: 700;
  color: var(--text-secondary) !important;
}

.row-zero td { background: rgba(244, 63, 94, 0.05) !important; }
.row-negative td { background: rgba(244, 63, 94, 0.02) !important; }

/* ── Status: copied ── */

/* ── Button group di header tabel ── */
.table-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

/* ── Download Excel button ── */
.btn-excel {
  background: var(--accent-secondary);
  color: #fff;
  border: 1px solid transparent;
  box-shadow: 0 1px 4px rgba(13, 155, 108, 0.20);
  transition: all var(--transition-fast);
}

.btn-excel:hover:not(:disabled) {
  background: #0b8a5e;
  box-shadow: 0 3px 10px rgba(13, 155, 108, 0.35);
  transform: translateY(-1px);
}

.btn-excel:active:not(:disabled) {
  transform: translateY(0);
}

.btn-excel.downloading {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none !important;
}

/* ── Spin animation (pakai yang sudah ada di main.css) ── */
.spin {
  animation: spin 0.8s linear infinite;
}
</style>
