#!/bin/bash
# MoviCol Frontend — Performance Test (Web Vitals)
# Prereqs: npm install -g lighthouse (or npx)
# Usage: ./tests/performance/run_lighthouse.sh

set -e
URL="${URL:-http://localhost:3000}"
RESULTS_DIR="$(dirname "$0")/results"
mkdir -p "$RESULTS_DIR"

echo "🧪 MoviCol Frontend Performance Test"
echo "   URL: $URL"
echo ""

# Verify frontend is running
if ! curl -s "$URL" > /dev/null 2>&1; then
    echo "❌ Frontend not running at $URL"
    exit 1
fi
echo "✅ Frontend is up"
echo ""

echo "Running Lighthouse audit..."
npx lighthouse "$URL" \
    --output json \
    --output html \
    --output-path "$RESULTS_DIR/lighthouse" \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices \
    --quiet

echo ""
echo "═══════════════════════════════════════"
echo "📊 Results:"
echo ""

# Parse key metrics
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$RESULTS_DIR/lighthouse.report.json'));
const perf = data.categories.performance.score * 100;
const a11y = data.categories.accessibility.score * 100;
const bp = data.categories['best-practices'].score * 100;
const fcp = data.audits['first-contentful-paint'].numericValue;
const lcp = data.audits['largest-contentful-paint'].numericValue;
const tbt = data.audits['total-blocking-time'].numericValue;
const cls = data.audits['cumulative-layout-shift'].numericValue;

console.log('  Performance:     ' + perf.toFixed(0) + '/100');
console.log('  Accessibility:   ' + a11y.toFixed(0) + '/100');
console.log('  Best Practices:  ' + bp.toFixed(0) + '/100');
console.log('');
console.log('  Core Web Vitals:');
console.log('    FCP: ' + (fcp/1000).toFixed(2) + 's');
console.log('    LCP: ' + (lcp/1000).toFixed(2) + 's');
console.log('    TBT: ' + tbt.toFixed(0) + 'ms');
console.log('    CLS: ' + cls.toFixed(3));
"

echo ""
echo "Full report: $RESULTS_DIR/lighthouse.report.html"
echo "═══════════════════════════════════════"
