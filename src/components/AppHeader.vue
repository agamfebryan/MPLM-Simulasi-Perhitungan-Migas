<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <div class="header-logo" @click="$emit('tab-change', 'input')">
        <div class="logo-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">Migas Calculate</span>
          <span class="logo-subtitle">Arus Kas &amp; Kelayakan Lapangan</span>
        </div>
      </div>

      <!-- Navigation Tabs (pill style) -->
      <nav class="header-nav">
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'input' }"
          @click="$emit('tab-change', 'input')"
        >
          <span class="nav-step">01</span>
          Form Input
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'hasil', disabled: !hasResult }"
          :disabled="!hasResult"
          @click="hasResult && $emit('tab-change', 'hasil')"
        >
          <span class="nav-step">02</span>
          Analisis
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  hasResult: { type: Boolean, required: true },
});
defineEmits(["tab-change"]);
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  height: 64px;
  box-shadow: 0px 1px 4px rgba(17, 25, 40, 0.06);
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.header-logo:hover {
  opacity: 0.85;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: var(--accent-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.logo-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  line-height: 1;
}

/* Pill Nav */
.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--bg-input);
  border-radius: var(--radius-pill);
  padding: 4px;
}

.nav-tab {
  background: transparent;
  border: none;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  line-height: 1;
}

.nav-step {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  background: transparent;
  line-height: 1;
}

.nav-tab:hover:not(.disabled):not(.active) {
  background: rgba(17, 25, 40, 0.06);
  color: var(--text-primary);
}

.nav-tab.active {
  background: var(--accent-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(26, 86, 219, 0.25);
}

.nav-tab.active .nav-step {
  color: rgba(255,255,255,0.7);
}

.nav-tab.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
