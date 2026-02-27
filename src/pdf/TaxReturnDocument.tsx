import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TaxInput, TaxResult } from '../tax-engine/types';
import { FILING_STATUS_LABELS } from '../tax-engine/types';

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
};
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '2px solid #1e40af', paddingBottom: 10 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 4 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 6, borderBottom: '1px solid #e5e7eb', paddingBottom: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  rowBold: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderTop: '1px solid #e5e7eb', marginTop: 2 },
  label: { color: '#374151' },
  labelBold: { fontFamily: 'Helvetica-Bold', color: '#111827' },
  value: { fontFamily: 'Helvetica', color: '#374151', textAlign: 'right' as const },
  valueBold: { fontFamily: 'Helvetica-Bold', color: '#111827', textAlign: 'right' as const },
  highlight: { backgroundColor: '#eff6ff', padding: 6, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  heroBanner: { padding: 12, borderRadius: 6, textAlign: 'center' as const, marginBottom: 16 },
  heroLabel: { fontSize: 10, color: '#374151', marginBottom: 2 },
  heroAmount: { fontSize: 22, fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', borderBottom: '1px solid #d1d5db', paddingBottom: 3, marginBottom: 3 },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', color: '#6b7280', fontSize: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 1.5 },
  tableCell: { color: '#374151' },
  footer: { position: 'absolute' as const, bottom: 30, left: 40, right: 40, borderTop: '1px solid #e5e7eb', paddingTop: 6 },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center' as const },
  note: { fontSize: 8, color: '#6b7280', marginLeft: 4 },
});

interface Props {
  input: TaxInput;
  result: TaxResult;
}

export function TaxReturnDocument({ input, result }: Props) {
  const isRefund = result.refundOrOwed >= 0;

  return (
    <Document title="2025 Federal Tax Summary" author="Tax Calculator">
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>2025 Federal Tax Summary</Text>
          <Text style={s.subtitle}>
            Filing Status: {FILING_STATUS_LABELS[input.filingStatus]} | Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Hero */}
        <View style={[s.heroBanner, { backgroundColor: isRefund ? '#f0fdf4' : '#fef2f2' }]}>
          <Text style={s.heroLabel}>{isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}</Text>
          <Text style={[s.heroAmount, { color: isRefund ? '#15803d' : '#dc2626' }]}>
            {fmt(Math.abs(result.refundOrOwed))}
          </Text>
          <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>
            Effective Rate: {pct(result.effectiveRate)} | Marginal Rate: {pct(result.marginalRate)}
          </Text>
        </View>

        {/* Income */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Income</Text>
          <Row label="Wage Income (W-2)" value={result.wageIncome} />
          <Row label="Self-Employment Income" value={result.selfEmploymentIncome} />
          <Row label="Interest Income" value={result.interestIncome} />
          <Row label="Dividend Income" value={result.ordinaryDividends} />
          <Row label="Short-Term Capital Gains" value={result.shortTermCapitalGains} />
          <Row label="Long-Term Capital Gains" value={result.longTermCapitalGains} />
          {result.realEstateGains > 0 && <Row label="Real Estate Gains" value={result.realEstateGains} />}
          {result.retirementIncome > 0 && <Row label="Retirement Income" value={result.retirementIncome} />}
          {result.otherIncome > 0 && <Row label="Other Income" value={result.otherIncome} />}
          <BoldRow label="Gross Income" value={result.grossIncome} />
        </View>

        {/* Adjustments */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Adjustments & AGI</Text>
          {result.halfSelfEmploymentTax > 0 && <Row label="1/2 Self-Employment Tax" value={-result.halfSelfEmploymentTax} />}
          <BoldRow label="Adjusted Gross Income" value={result.agi} />
        </View>

        {/* Deductions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Deductions</Text>
          <Row label={`${result.deductionUsed === 'standard' ? 'Standard' : 'Itemized'} Deduction`} value={result.deductionAmount} />
          <BoldRow label="Taxable Income" value={result.taxableIncome} />
        </View>

        {/* Tax Bracket Table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tax Calculation</Text>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, { width: '15%' }]}>Rate</Text>
            <Text style={[s.tableHeaderCell, { width: '35%' }]}>Bracket</Text>
            <Text style={[s.tableHeaderCell, { width: '25%', textAlign: 'right' as const }]}>Income</Text>
            <Text style={[s.tableHeaderCell, { width: '25%', textAlign: 'right' as const }]}>Tax</Text>
          </View>
          {result.ordinaryTaxByBracket.filter(b => b.taxableInBracket > 0).map((b, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '15%' }]}>{pct(b.rate)}</Text>
              <Text style={[s.tableCell, { width: '35%' }]}>{fmt(b.rangeStart)} - {b.rangeEnd >= 1e9 ? '...' : fmt(b.rangeEnd)}</Text>
              <Text style={[s.tableCell, { width: '25%', textAlign: 'right' as const }]}>{fmt(b.taxableInBracket)}</Text>
              <Text style={[s.tableCell, { width: '25%', textAlign: 'right' as const }]}>{fmt(b.taxOnBracket)}</Text>
            </View>
          ))}
          <BoldRow label="Ordinary Income Tax" value={result.ordinaryIncomeTax} />
          {result.capitalGainsTax > 0 && <Row label="Capital Gains Tax" value={result.capitalGainsTax} />}
          {result.selfEmploymentTax > 0 && <Row label="Self-Employment Tax" value={result.selfEmploymentTax} />}
          {result.additionalMedicareTax > 0 && <Row label="Additional Medicare Tax" value={result.additionalMedicareTax} />}
          {result.niit > 0 && <Row label="Net Investment Income Tax" value={result.niit} />}
          <BoldRow label="Total Tax" value={result.totalTax} />
        </View>

        {/* Credits & Payments */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Credits & Payments</Text>
          <Row label="Federal Tax Withheld" value={result.totalFederalWithheld} />
          <Row label="Estimated Payments" value={result.totalEstimatedPayments} />
          <BoldRow label="Total Credits & Payments" value={result.totalCreditsAndPayments} />
        </View>

        {/* Final */}
        <View style={[s.highlight, { backgroundColor: isRefund ? '#f0fdf4' : '#fef2f2' }]}>
          <Text style={s.labelBold}>{isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}</Text>
          <Text style={[s.valueBold, { color: isRefund ? '#15803d' : '#dc2626' }]}>
            {fmt(Math.abs(result.refundOrOwed))}
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            For estimation purposes only. Not professional tax advice. Consult a qualified tax professional for actual tax preparation.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{fmt(value)}</Text>
    </View>
  );
}

function BoldRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.rowBold}>
      <Text style={s.labelBold}>{label}</Text>
      <Text style={s.valueBold}>{fmt(value)}</Text>
    </View>
  );
}
