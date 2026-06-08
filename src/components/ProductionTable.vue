<template>
  <div class="prod-table-wrap">
    <div class="prod-table-header">
      <span class="label-caps">Preview Produksi</span>
      <span class="prod-total">Total: {{ totalProd.toLocaleString("id-ID", { maximumFractionDigits: 1 }) }} Mbbl</span>
    </div>

    <!-- Vertical two-column grid — never overflows horizontally -->
    <div class="prod-grid-scroll">
      <div class="prod-grid">
        <div
          v-for="(q, i) in production"
          :key="i"
          class="prod-grid-row"
        >
          <span class="prod-grid-year">Thn {{ i + 1 }}</span>
          <span class="prod-grid-val monospace">
            {{ q.toLocaleString("id-ID", { maximumFractionDigits: 1 }) }}
            <small>Mbbl</small>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  production: { type: Array, default: () => [] },
  jangkaWaktu: { type: Number, default: 10 },
});
const totalProd = computed(() => props.production.reduce((a, b) => a + b, 0));
</script>

<style scoped>
.prod-table-wrap {
  margin-top: var(--space-3);
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.prod-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.prod-total {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-secondary);
}

/* Scrollable vertical container */
.prod-grid-scroll {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
}

/* Two-column grid of year rows */
.prod-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}

.prod-grid-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: 6px;
  padding: 5px 8px;
  gap: var(--space-2);
  min-width: 0;
}

.prod-grid-year {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.prod-grid-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-secondary);
  text-align: right;
  white-space: nowrap;
}

.prod-grid-val small {
  font-size: 10px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 2px;
}
</style>
