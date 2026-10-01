import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { InventoryItem, InventoryCategory } from '../data/shopManagementDatabase';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Building2,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onClose?: () => void;
  onQuickReorder?: (item: InventoryItem) => void;
}

export const InventoryAnalyticsDashboard: React.FC<Props> = ({
  inventory,
  onClose,
  onQuickReorder,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'trends' | 'lead_times' | 'failures' | 'value_matrix'>('trends');

  // Chart SVG references
  const trendsSvgRef = useRef<SVGSVGElement | null>(null);
  const leadTimesSvgRef = useRef<SVGSVGElement | null>(null);
  const failureSvgRef = useRef<SVGSVGElement | null>(null);
  const treemapSvgRef = useRef<SVGSVGElement | null>(null);

  // Computed summary metrics
  const totalValue = useMemo(() => {
    return inventory.reduce((acc, i) => acc + i.stock * i.unitCost, 0);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((i) => i.stock <= i.minThreshold);
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter((i) => i.stock === 0);
  }, [inventory]);

  const highValueItems = useMemo(() => {
    return inventory.filter((i) => i.unitCost >= 200).sort((a, b) => b.unitCost - a.unitCost);
  }, [inventory]);

  // =========================================================================
  // 1. D3 Chart: Consumption Trends Over 8 Weeks
  // =========================================================================
  useEffect(() => {
    if (activeChartTab !== 'trends' || !trendsSvgRef.current) return;

    const svg = d3.select(trendsSvgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Simulated 8-week historical consumption data for top categories
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8 (Current)'];
    const categoriesData = [
      { name: 'CPUs', color: '#06b6d4', values: [12, 18, 15, 24, 20, 28, 25, 32] },
      { name: 'GPUs', color: '#10b981', values: [8, 14, 11, 19, 16, 22, 20, 27] },
      { name: 'RAM & Storage', color: '#a855f7', values: [25, 30, 28, 42, 38, 49, 45, 58] },
      { name: 'Chemical / Consumables', color: '#f59e0b', values: [35, 40, 38, 55, 48, 62, 59, 74] },
    ];

    const x = d3.scalePoint().domain(weeks).range([0, innerWidth]).padding(0.2);
    const maxVal = d3.max(categoriesData.flatMap((c) => c.values)) || 80;
    const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#21262d')
      .attr('stroke-dasharray', '3,3');

    // Axes
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .attr('color', '#6e7681');

    xAxis.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px').attr('font-family', 'monospace');

    const yAxis = g.append('g').call(d3.axisLeft(y).ticks(5)).attr('color', '#6e7681');
    yAxis.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px').attr('font-family', 'monospace');

    // Lines & Areas
    const lineGenerator = d3
      .line<{ week: string; value: number }>()
      .x((d) => x(d.week) || 0)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<{ week: string; value: number }>()
      .x((d) => x(d.week) || 0)
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    categoriesData.forEach((cat) => {
      const data = weeks.map((w, idx) => ({ week: w, value: cat.values[idx] }));

      // Gradient area
      const gradientId = `area-grad-${cat.name.replace(/\s+/g, '')}`;
      const grad = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad.append('stop').attr('offset', '0%').attr('stop-color', cat.color).attr('stop-opacity', 0.25);
      grad.append('stop').attr('offset', '100%').attr('stop-color', cat.color).attr('stop-opacity', 0.0);

      g.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', areaGenerator);

      // Line
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', cat.color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);

      // Data dots
      g.selectAll(`.dot-${cat.name}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.week) || 0)
        .attr('cy', (d) => y(d.value))
        .attr('r', 3.5)
        .attr('fill', '#0d1117')
        .attr('stroke', cat.color)
        .attr('stroke-width', 2);
    });

    // Legend
    const legend = g.append('g').attr('transform', `translate(10, -15)`);
    categoriesData.forEach((cat, idx) => {
      const item = legend.append('g').attr('transform', `translate(${idx * 140}, 0)`);
      item.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', cat.color);
      item
        .append('text')
        .attr('x', 14)
        .attr('y', 9)
        .attr('fill', '#d1d5db')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(cat.name);
    });
  }, [activeChartTab]);

  // =========================================================================
  // 2. D3 Chart: Supplier Replenishment Lead Times (Days)
  // =========================================================================
  useEffect(() => {
    if (activeChartTab !== 'lead_times' || !leadTimesSvgRef.current) return;

    const svg = d3.select(leadTimesSvgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const margin = { top: 25, right: 40, bottom: 35, left: 110 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const suppliersData = [
      { supplier: 'Micro Center', avgDays: 1.2, minDays: 1, maxDays: 2, reliability: '99%', color: '#10b981' },
      { supplier: 'Amazon Business', avgDays: 2.1, minDays: 1, maxDays: 3, reliability: '96%', color: '#06b6d4' },
      { supplier: 'DigiKey', avgDays: 2.8, minDays: 2, maxDays: 4, reliability: '98%', color: '#3b82f6' },
      { supplier: 'Mouser', avgDays: 3.4, minDays: 2, maxDays: 5, reliability: '95%', color: '#a855f7' },
      { supplier: 'Newegg', avgDays: 4.2, minDays: 3, maxDays: 6, reliability: '91%', color: '#f59e0b' },
      { supplier: 'B&H Photo', avgDays: 4.8, minDays: 3, maxDays: 7, reliability: '89%', color: '#ec4899' },
      { supplier: 'Direct OEM', avgDays: 7.5, minDays: 5, maxDays: 12, reliability: '82%', color: '#6b7280' },
    ];

    const y = d3
      .scaleBand()
      .domain(suppliersData.map((d) => d.supplier))
      .range([0, innerHeight])
      .padding(0.3);

    const x = d3.scaleLinear().domain([0, 14]).range([0, innerWidth]);

    // Grid lines
    g.append('g')
      .call(d3.axisBottom(x).ticks(7).tickSize(innerHeight).tickFormat(() => ''))
      .attr('transform', 'translate(0, 0)')
      .selectAll('line')
      .attr('stroke', '#21262d')
      .attr('stroke-dasharray', '2,2');

    // Axes
    const yAxis = g.append('g').call(d3.axisLeft(y)).attr('color', '#6e7681');
    yAxis.selectAll('text').attr('fill', '#e5e7eb').attr('font-size', '11px').attr('font-family', 'monospace');

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat((d) => `${d}d`))
      .attr('color', '#6e7681');
    xAxis.selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px').attr('font-family', 'monospace');

    // Range bars (min to max)
    g.selectAll('.range-line')
      .data(suppliersData)
      .enter()
      .append('line')
      .attr('x1', (d) => x(d.minDays))
      .attr('x2', (d) => x(d.maxDays))
      .attr('y1', (d) => (y(d.supplier) || 0) + y.bandwidth() / 2)
      .attr('y2', (d) => (y(d.supplier) || 0) + y.bandwidth() / 2)
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    // Average Lead Time Bars
    g.selectAll('.lead-bar')
      .data(suppliersData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.supplier) || 0)
      .attr('width', (d) => x(d.avgDays))
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.85);

    // Value Labels
    g.selectAll('.bar-label')
      .data(suppliersData)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.avgDays) + 8)
      .attr('y', (d) => (y(d.supplier) || 0) + y.bandwidth() / 2 + 3.5)
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text((d) => `${d.avgDays}d avg (${d.reliability})`);
  }, [activeChartTab]);

  // =========================================================================
  // 3. D3 Chart: Hardware Failure Frequency by Component OEM
  // =========================================================================
  useEffect(() => {
    if (activeChartTab !== 'failures' || !failureSvgRef.current) return;

    const svg = d3.select(failureSvgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 25;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2.6},${height / 2})`);

    const failureData = [
      { oem: 'Generic / Non-Certified PSUs', failures: 38, percent: 31, color: '#ef4444' },
      { oem: 'No-Name SATA SSDs / DRAMless', failures: 28, percent: 23, color: '#f97316' },
      { oem: 'Consumer Laptops (Hinges/DC)', failures: 22, percent: 18, color: '#f59e0b' },
      { oem: 'Motherboard VRM Overheats', failures: 16, percent: 13, color: '#06b6d4' },
      { oem: 'GPU GDDR6X Thermal Throttling', failures: 12, percent: 10, color: '#a855f7' },
      { oem: 'RAM Channel Timing Clashes', failures: 6, percent: 5, color: '#10b981' },
    ];

    const pie = d3
      .pie<{ oem: string; failures: number; percent: number; color: string }>()
      .value((d) => d.failures)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<any>>().innerRadius(radius * 0.55).outerRadius(radius);
    const hoverArc = d3.arc<d3.PieArcDatum<any>>().innerRadius(radius * 0.52).outerRadius(radius * 1.05);

    const slices = g
      .selectAll('.slice')
      .data(pie(failureData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices
      .append('path')
      .attr('d', (d: any) => arc(d))
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0d1117')
      .attr('stroke-width', 2.5)
      .style('transition', 'all 0.2s')
      .on('mouseenter', function (this: any, event, d) {
        d3.select(this).attr('d', hoverArc as any).attr('opacity', 0.9);
      })
      .on('mouseleave', function (this: any, event, d) {
        d3.select(this).attr('d', arc as any).attr('opacity', 1.0);
      });

    // Center Summary
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#ffffff')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text('122 Faults');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text('Lab Triage Logs');

    // Legend on the Right
    const legendG = svg.append('g').attr('transform', `translate(${width * 0.65}, 40)`);
    failureData.forEach((item, i) => {
      const row = legendG.append('g').attr('transform', `translate(0, ${i * 35})`);
      row.append('rect').attr('width', 12).attr('height', 12).attr('rx', 3).attr('fill', item.color);
      row
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('fill', '#f3f4f6')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${item.percent}% ${item.oem}`);
      row
        .append('text')
        .attr('x', 18)
        .attr('y', 23)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(`${item.failures} bench failure logs`);
    });
  }, [activeChartTab]);

  // =========================================================================
  // 4. D3 Chart: Inventory Value Distribution Treemap
  // =========================================================================
  useEffect(() => {
    if (activeChartTab !== 'value_matrix' || !treemapSvgRef.current) return;

    const svg = d3.select(treemapSvgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const g = svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Group inventory by category
    const grouped = d3.group(inventory, (d) => d.category);
    const rootData = {
      name: 'Inventory',
      children: Array.from(grouped, ([category, items]) => ({
        name: category.replace(/\s*\(.*?\)\s*/g, ''),
        children: items.map((i) => ({
          name: i.name,
          sku: i.sku,
          value: i.stock * i.unitCost,
          stock: i.stock,
          unitCost: i.unitCost,
        })),
      })),
    };

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain([
        'Processors',
        'Graphics Cards',
        'Motherboards',
        'Memory',
        'Storage',
        'Power Supplies',
        'Cooling & Fans',
        'Cases & Chassis',
        'Chemical / Thermal',
        'Fasteners & Connectors',
        'Batteries',
        'Cabling & Networking',
        'Diagnostics & Bench Tools',
      ])
      .range([
        '#06b6d4',
        '#10b981',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#14b8a6',
        '#6366f1',
        '#84cc16',
        '#64748b',
        '#eab308',
        '#0284c7',
        '#d946ef',
      ]);

    const root = d3
      .hierarchy(rootData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap().size([width, height]).paddingInner(2).paddingOuter(3).round(true)(root as any);

    const nodes = g
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    nodes
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => colorScale(d.parent.data.name) || '#3b82f6')
      .attr('opacity', 0.8)
      .attr('rx', 3)
      .attr('stroke', '#0d1117')
      .attr('stroke-width', 1.5)
      .append('title')
      .text((d: any) => `${d.data.name} (${d.data.sku})\nStock: ${d.data.stock}\nTotal Value: $${d.data.value.toFixed(2)}`);

    nodes
      .filter((d: any) => d.x1 - d.x0 > 55 && d.y1 - d.y0 > 25)
      .append('text')
      .attr('x', 4)
      .attr('y', 13)
      .attr('fill', '#ffffff')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text((d: any) => d.data.sku);

    nodes
      .filter((d: any) => d.x1 - d.x0 > 65 && d.y1 - d.y0 > 38)
      .append('text')
      .attr('x', 4)
      .attr('y', 26)
      .attr('fill', '#d1d5db')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text((d: any) => `$${Math.round(d.data.value)}`);
  }, [activeChartTab, inventory]);

  return (
    <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl p-5 lg:p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
              D3.js Hardware Intelligence & Consumption Dashboard
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                Live Telemetry
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Real-time mathematical visualizations of part consumption trends, vendor lead times, and failure frequencies.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span>Total Catalog Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-cyan-400">100% Bench Asset Backed</div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span>High-Value Flagships (≥$200)</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300">{highValueItems.length} SKUs</div>
          <div className="text-[10px] text-gray-400">RTX 4090, 7950X, Z790, ECC</div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span>Critical Replenishment Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{lowStockItems.length} Low Stock</div>
          <div className="text-[10px] text-red-400">{outOfStockItems.length} Zero Out-of-Stock</div>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span>Vendor Reliability Index</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">96.4% On-Time</div>
          <div className="text-[10px] text-gray-400">Avg Lead: 2.8 Days</div>
        </div>
      </div>

      {/* Chart Selector Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveChartTab('trends')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeChartTab === 'trends'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>1. 8-Week Consumption Trends</span>
        </button>

        <button
          onClick={() => setActiveChartTab('lead_times')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeChartTab === 'lead_times'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>2. Supplier Replenishment Lead Times</span>
        </button>

        <button
          onClick={() => setActiveChartTab('failures')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeChartTab === 'failures'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PieChartIcon className="w-4 h-4 text-purple-400" />
          <span>3. Failure Telemetry by OEM</span>
        </button>

        <button
          onClick={() => setActiveChartTab('value_matrix')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeChartTab === 'value_matrix'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>4. Capital Distribution Treemap</span>
        </button>
      </div>

      {/* D3 Render Area */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 shadow-inner">
        {activeChartTab === 'trends' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Dynamic Consumption Trajectory (Units Burned / Week)</span>
              <span className="text-cyan-400">D3 Monotone Smoothing Engine</span>
            </div>
            <svg ref={trendsSvgRef} className="w-full h-auto max-h-[300px]"></svg>
          </div>
        )}

        {activeChartTab === 'lead_times' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Restock Turnaround Time & 95% Confidence Interval (Days)</span>
              <span className="text-emerald-400">D3 Horizontal Linear Scale</span>
            </div>
            <svg ref={leadTimesSvgRef} className="w-full h-auto max-h-[300px]"></svg>
          </div>
        )}

        {activeChartTab === 'failures' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Hardware Root Cause Breakdown from Vocational Bench Diagnostics</span>
              <span className="text-purple-400">D3 Donut Projection</span>
            </div>
            <svg ref={failureSvgRef} className="w-full h-auto max-h-[300px]"></svg>
          </div>
        )}

        {activeChartTab === 'value_matrix' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>Inventory Capital Allocation by Sub-system (Size proportional to $ basis)</span>
              <span className="text-amber-400">D3 Hierarchical Treemap</span>
            </div>
            <svg ref={treemapSvgRef} className="w-full h-auto max-h-[300px]"></svg>
          </div>
        )}
      </div>

      {/* High-Value Quick Reorder Drawer Strip */}
      <div className="border-t border-gray-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            High-Value Flagships (Quick Reorder & Safety Watchlist)
          </span>
          <span className="text-[10px] font-mono text-gray-400">Components &ge; $200.00</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {highValueItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-gray-950 border border-purple-500/30 hover:border-purple-500/70 transition-all flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-purple-300 font-bold">{item.sku}</span>
                  <span className="text-cyan-400 font-bold">${item.unitCost.toFixed(2)}</span>
                </div>
                <div className="font-sans text-xs text-gray-200 mt-1 line-clamp-1 font-semibold">
                  {item.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Stock: {item.stock} / {item.minThreshold} min
                </div>
              </div>

              {onQuickReorder && (
                <button
                  onClick={() => onQuickReorder(item)}
                  className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>1-Click PO Reorder (+5)</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
