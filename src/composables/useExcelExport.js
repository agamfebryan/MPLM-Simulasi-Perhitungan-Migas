import * as XLSX from 'xlsx'

/**
 * Format angka ke string tanpa simbol mata uang (untuk Excel)
 * Supaya Excel bisa tetap mengenali sebagai angka.
 */
function numVal(val) {
  if (val === null || val === undefined || isNaN(val)) return null
  return Number(val)
}

/**
 * Export tabel NCF ke file Excel (.xlsx)
 * @param {Array} rows - Array baris dari result.tabelNCF
 * @param {Object} indicators - { pot, npv, ror, pir, dpr }
 * @param {Object} input - Data input simulasi
 * @param {Number} discountRate - Discount rate yang dipakai
 */
export function exportToExcel(rows, indicators, input, discountRate) {
  const wb = XLSX.utils.book_new()

  // ── SHEET 1: Tabel NCF ───────────────────────────────────────
  const ncfHeader = [
    'Tahun',
    'Produksi Minyak (Mbbl)',
    'Total Pendapatan (Rp)',
    'Modal Capital (Rp)',
    'Modal Non-Capital (Rp)',
    'Biaya Opex (Rp)',
    'Depresiasi / Penyusutan (Rp)',
    'Keuntungan Kena Pajak (Rp)',
    'Setoran Pajak (Rp)',
    'Arus Kas Bersih / NCF (Rp)',
    'Akumulasi Keuntungan (Rp)',
  ]

  const ncfData = rows.map(r => [
    r.tahun,
    numVal(r.produksi),
    numVal(r.income),
    numVal(r.capital),
    numVal(r.nonCapital),
    numVal(r.opex),
    numVal(r.Di),
    numVal(r.taxableIncome),
    numVal(r.tax),
    numVal(r.ncf),
    numVal(r.cumulativeNcf),
  ])

  // Baris total
  const sumNonNull = (key) => rows.reduce((a, r) => a + (r[key] !== null && r[key] !== undefined ? r[key] : 0), 0)
  const totalRow = [
    'TOTAL SIMULASI',
    sumNonNull('produksi'),
    sumNonNull('income'),
    sumNonNull('capital'),
    sumNonNull('nonCapital'),
    sumNonNull('opex'),
    sumNonNull('Di'),
    sumNonNull('taxableIncome'),
    sumNonNull('tax'),
    rows.reduce((a, r) => a + (r.ncf || 0), 0),
    null,
  ]

  const ncfSheet = XLSX.utils.aoa_to_sheet([ncfHeader, ...ncfData, totalRow])

  // Lebar kolom
  ncfSheet['!cols'] = [
    { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
    { wch: 18 }, { wch: 26 }, { wch: 24 }, { wch: 18 }, { wch: 24 }, { wch: 24 },
  ]

  XLSX.utils.book_append_sheet(wb, ncfSheet, 'Tabel NCF')

  // ── SHEET 2: Indikator Ekonomi ───────────────────────────────
  const indData = [
    ['RINGKASAN INDIKATOR EKONOMI', ''],
    ['', ''],
    ['Discount Rate yang Digunakan', `${discountRate}%`],
    ['', ''],
    ['Payback Period (POT)', indicators.pot !== null ? `${Number(indicators.pot).toFixed(2)} tahun` : 'N/A'],
    ['Net Present Value (NPV)', indicators.npv !== null ? numVal(indicators.npv) : 'N/A'],
    ['Rate of Return (ROR / IRR)', indicators.ror !== null ? `${Number(indicators.ror).toFixed(2)}%` : 'N/A'],
    ['Profitability Index Ratio (PIR)', indicators.pir !== null ? Number(indicators.pir).toFixed(4) : 'N/A'],
    ['Discounted Profit Ratio (DPR)', indicators.dpr !== null ? Number(indicators.dpr).toFixed(4) : 'N/A'],
  ]

  const indSheet = XLSX.utils.aoa_to_sheet(indData)
  indSheet['!cols'] = [{ wch: 35 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, indSheet, 'Indikator Ekonomi')

  // ── SHEET 3: Parameter Input ─────────────────────────────────
  const inputData = [
    ['PARAMETER INPUT SIMULASI', ''],
    ['', ''],
    ['Jangka Waktu', `${input.jangkaWaktu} tahun`],
    ['Harga Minyak', numVal(input.hargaMinyak)],
    ['Produksi Awal (Mbbl)', numVal(input.produksiAwal)],
    ['Decline Rate (%)', numVal(input.declineRate)],
    ['Modal Capital (Rp)', numVal(input.capital)],
    ['Modal Non-Capital (Rp)', numVal(input.nonCapital)],
    ['Biaya Opex / tahun (Rp)', numVal(input.opex)],
    ['Tarif Pajak (%)', numVal(input.taxRate)],
    ['Metode Depresiasi', input.metodeDepresiasi || '-'],
  ]

  const inputSheet = XLSX.utils.aoa_to_sheet(inputData)
  inputSheet['!cols'] = [{ wch: 30 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, inputSheet, 'Parameter Input')

  // ── Generate file name ────────────────────────────────────────
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const fileName = `Simulasi_NCF_Migas_${dateStr}.xlsx`

  // ── Download ──────────────────────────────────────────────────
  XLSX.writeFile(wb, fileName)
}
