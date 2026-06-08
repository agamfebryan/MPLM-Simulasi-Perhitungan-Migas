<template>
  <div id="migas-app">
    <AppHeader :activeTab="activeTab" :hasResult="!!result" @tab-change="switchTab" />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Menghitung...</p>
    </div>

    <!-- TAB 1: INPUT -->
    <main v-show="activeTab === 'input'">
      <InputPanel
        @calculate="handleCalculate"
        @saved="handleSaved"
      />
    </main>

    <!-- TAB 2: HASIL -->
    <main v-if="activeTab === 'hasil' && result" class="hasil-main">
      <div class="hasil-inner fade-in">

        <!-- Indicator Cards -->
        <IndicatorCards
          :pot="indicators.pot"
          :npv="indicators.npv"
          :ror="indicators.ror"
          :pir="indicators.pir"
          :dpr="indicators.dpr"
          :discountRate="discountRate"
          :jangkaWaktu="result.input.jangkaWaktu"
          @rate-change="onRateChange"
        />



        <!-- NCF Table -->
        <ResultTable :rows="result.tabelNCF" />

        <!-- Charts -->
        <div class="charts-grid">
          <ChartNCF :rows="result.tabelNCF" />
          <ChartCumulative :rows="result.tabelNCF" :pot="indicators.pot" />
          <ChartRvsNPV :rows="result.tabelNCF" :ror="indicators.ror" />
        </div>

        <!-- Depreciation Detail (collapsible) -->
        <div class="dep-section">
          <button class="btn btn-ghost" @click="showDepDetail = !showDepDetail">
            {{ showDepDetail ? '▲' : '▼' }} Detail Depresiasi
          </button>
          <div v-if="showDepDetail">
            <DepreciationTable
              :rows="result.depreciationRows"
              :compact="false"
            />
          </div>
        </div>

        <!-- Analysis & Explanation (Collapsible wrapper inside) -->
        <AnalysisPanel
          :tabelNCF="result.tabelNCF"
          :indicators="indicators"
          :input="result.input"
          :discountRate="discountRate"
        />

        <!-- Action -->
        <div class="hasil-actions">
          <button class="btn btn-ghost" @click="switchTab('input')">← Ubah Input</button>
          <button class="btn btn-secondary" @click="triggerSave">Simpan Skenario</button>
        </div>
      </div>
    </main>

    <!-- TAB 2: No result yet -->
    <main v-if="activeTab === 'hasil' && !result" class="empty-hasil">
      <div class="empty-state-hasil">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h2>Belum Ada Hasil Perhitungan</h2>
        <p>Isi form input dan klik "Jalankan Simulasi"</p>
        <button class="btn btn-primary" @click="switchTab('input')">Ke Form Input</button>
      </div>
    </main>

    <!-- TAB 3: SKENARIO -->
    <main v-if="activeTab === 'skenario'">
      <div v-if="!showCompare">
        <ScenarioList
          :scenarios="scenarios"
          :compareIds="compareIds"
          @go-input="switchTab('input')"
          @load="handleLoad"
          @delete="handleDelete"
          @toggle-compare="toggleCompare"
          @compare="doCompare"
        />
      </div>
      <div v-else>
        <ComparePanel
          :a="compareScenarios[0]"
          :b="compareScenarios[1]"
          @close="showCompare = false; compareIds = []"
        />
      </div>
    </main>

    <!-- Save Dialog from Hasil tab -->
    <div v-if="showSaveFromHasil" class="modal-overlay" @click.self="showSaveFromHasil = false">
      <div class="modal-box">
        <h3 class="modal-title">Simpan Skenario</h3>
        <div class="form-group">
          <label class="form-label">Nama Skenario</label>
          <input
            id="input-save-hasil"
            v-model="saveName"
            type="text"
            class="form-input"
            placeholder="cth: Lapangan RISKI - Optimis"
            @keyup.enter="confirmSaveFromHasil"
          />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showSaveFromHasil = false">Batal</button>
          <button class="btn btn-primary" @click="confirmSaveFromHasil" :disabled="!saveName.trim()">
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import InputPanel from './components/InputPanel.vue'
import IndicatorCards from './components/IndicatorCards.vue'
import ResultTable from './components/ResultTable.vue'
import ChartNCF from './components/ChartNCF.vue'
import ChartCumulative from './components/ChartCumulative.vue'
import ChartRvsNPV from './components/ChartRvsNPV.vue'
import DepreciationTable from './components/DepreciationTable.vue'
import ScenarioList from './components/ScenarioList.vue'
import ComparePanel from './components/ComparePanel.vue'
import AnalysisPanel from './components/AnalysisPanel.vue'

import { computeNCF } from './composables/useCalculator.js'
import { computeDepreciation } from './composables/useDepreciation.js'
import { computeAllIndicators, computeNPV } from './composables/useIndicators.js'
import { loadScenarios, saveScenario, deleteScenario } from './composables/useStorage.js'

// ── State ──────────────────────────────────────────────────
const activeTab     = ref('input')
const isLoading     = ref(false)
const result        = ref(null)   // { tabelNCF, depreciationRows, input }
const discountRate  = ref(10)
const showDepDetail = ref(false)
const scenarios     = ref(loadScenarios())
const compareIds    = ref([])
const showCompare   = ref(false)
const showSaveFromHasil = ref(false)
const saveName      = ref('')
const lastInput     = ref(null)

// ── Computed Indicators (reactive to discountRate) ──────────
const indicators = computed(() => {
  if (!result.value) return { pot: null, npv: 0, ror: null, pir: null, dpr: null }
  const totalInv = (result.value.input.capital || 0) + (result.value.input.nonCapital || 0)
  return computeAllIndicators(result.value.tabelNCF, discountRate.value, totalInv)
})

const compareScenarios = computed(() =>
  compareIds.value.map(id => scenarios.value.find(s => s.id === id)).filter(Boolean)
)

// ── Methods ─────────────────────────────────────────────────
function switchTab(tab) {
  activeTab.value = tab
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleCalculate(inputData) {
  isLoading.value = true
  lastInput.value = inputData

  // Small delay for loading animation UX
  await new Promise(r => setTimeout(r, 400))

  try {
    const tabelNCF = computeNCF(inputData)
    const { computeProduction } = await import('./composables/useCalculator.js')
    const production = computeProduction(inputData)
    const depreciationRows = computeDepreciation(inputData, production)

    result.value = { tabelNCF, depreciationRows, input: { ...inputData } }
    discountRate.value = 10
    switchTab('hasil')
  } finally {
    isLoading.value = false
  }
}

function onRateChange(newRate) {
  discountRate.value = newRate
}

function triggerSave() {
  saveName.value = lastInput.value?.nama || ''
  showSaveFromHasil.value = true
}

function confirmSaveFromHasil() {
  if (!saveName.value.trim() || !result.value) return
  const totalInv = (result.value.input.capital || 0) + (result.value.input.nonCapital || 0)
  const ind = indicators.value
  const entry = saveScenario(saveName.value.trim(), result.value.input, {
    tabelNCF: result.value.tabelNCF,
    totalNCF: result.value.tabelNCF.reduce((s, r) => s + r.ncf, 0),
    pot: ind.pot,
    npv: { rate: discountRate.value, value: ind.npv },
    ror: ind.ror,
    pir: ind.pir,
    dpr: ind.dpr,
  })
  scenarios.value = loadScenarios()
  showSaveFromHasil.value = false
}

function handleSaved(nama) {
  // Called from InputPanel save dialog → just update scenario list
  scenarios.value = loadScenarios()
}

function handleLoad(scenario) {
  // Load scenario back to input and recalculate
  lastInput.value = { ...scenario.input }
  handleCalculate(scenario.input)
}

function handleDelete(id) {
  deleteScenario(id)
  scenarios.value = loadScenarios()
  compareIds.value = compareIds.value.filter(cid => cid !== id)
}

function toggleCompare(id) {
  const idx = compareIds.value.indexOf(id)
  if (idx >= 0) {
    compareIds.value = compareIds.value.filter(cid => cid !== id)
  } else if (compareIds.value.length < 2) {
    compareIds.value = [...compareIds.value, id]
  }
}

function doCompare(ids) {
  compareIds.value = ids
  showCompare.value = true
}
</script>

<style>
@import './styles/main.css';

.hasil-main {
  min-height: calc(100vh - 64px);
}

.hasil-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.dep-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hasil-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  border-top: var(--border-thin);
}

.empty-hasil {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
}

.empty-state-hasil {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--bg-input);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}

.empty-state-hasil h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-secondary);
}

.empty-state-hasil p {
  font-size: 14px;
  color: var(--text-muted);
}

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

@media (max-width: 1000px) {
  .charts-grid { grid-template-columns: 1fr; }
}
</style>
