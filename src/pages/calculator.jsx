import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Percent } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { usePageMeta, breadcrumb } from '@/hooks/usePageMeta';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export default function ROICalculator() {
  usePageMeta({
    title: 'AI Marketing ROI Calculator | Disruptors Media',
    description: 'Estimate the revenue impact of AI-powered marketing automation on your leads, conversion rate, and sales velocity.',
    path: '/calculator',
    jsonLd: breadcrumb('ROI Calculator', '/calculator'),
  });

  const [leads, setLeads] = useState(1000);
  const [conversion, setConversion] = useState(5);
  const [acv, setAcv] = useState(10000);
  const [automation, setAutomation] = useState(20);
  const [velocity, setVelocity] = useState(30);
  
  const [baselineRevenue, setBaselineRevenue] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);

  useEffect(() => {
    const baselineSQLs = leads * (conversion / 100);
    const baselineRev = baselineSQLs * acv;
    setBaselineRevenue(baselineRev);

    const projectedConversion = conversion * (1 + (automation / 100));
    const projectedLeads = leads * (1 + (velocity / 100));
    const projectedSQLs = projectedLeads * (projectedConversion / 100);
    const projectedRev = projectedSQLs * acv;
    setProjectedRevenue(projectedRev);

  }, [leads, conversion, acv, automation, velocity]);

  const delta = projectedRevenue - baselineRevenue;

  return (
    <div className="bg-[#1A1A1A] text-[#EAEAEA]">
      <div className="bg-[#0E0E0E] border-b border-[#2A2A2A] py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="text-4xl sm:text-5xl font-bold text-white tracking-tight">ROI Calculator</motion.h1>
          <motion.p initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay: 0.1}} className="mt-6 text-lg sm:text-xl text-[#C7C7C7] max-w-3xl mx-auto">Model the upside without the hype. Adjust the sliders to see the potential lift from an AI-powered marketing system.</motion.p>
        </div>
      </div>

      <div className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Inputs */}
            <div className="bg-[#0E0E0E] border border-[#2A2A2A] p-8 rounded-2xl space-y-8">
              <h2 className="text-2xl font-bold text-white">Your Inputs</h2>
              <InputGroup label="Monthly Leads" value={leads} setValue={setLeads} type="number" />
              <InputGroup label="Lead-to-SQL Conversion" value={conversion} setValue={setConversion} type="percent" />
              <InputGroup label="Average Contract Value (ACV)" value={acv} setValue={setAcv} type="currency" />
              
              <h3 className="text-xl font-bold text-white pt-4 border-t border-[#2A2A2A]">Projected Lift</h3>
              <SliderGroup label="Automation Lift on Conversion" value={automation} setValue={setAutomation} />
              <SliderGroup label="Content Velocity Lift on Leads" value={velocity} setValue={setVelocity} />
            </div>

            {/* Outputs */}
            <div className="bg-[#1A1A1A] p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-8">Projected Results</h2>
              <div className="space-y-6">
                <OutputCard label="Baseline Annual Revenue" value={formatCurrency(baselineRevenue * 12)} />
                <OutputCard label="Projected Annual Revenue" value={formatCurrency(projectedRevenue * 12)} isPrimary />
                <OutputCard label="Projected Annual Lift" value={formatCurrency(delta * 12)} isGold />
              </div>
              <div className="mt-12 text-center bg-[#0E0E0E] border border-[#2A2A2A] p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Review Your Model</h3>
                  <p className="text-[#C7C7C7] mb-6">Let's build a detailed plan based on your numbers.</p>
                  <Button asChild size="lg" className="bg-white text-[#0E0E0E] font-semibold hover:bg-[#EAEAEA] rounded-xl">
                      <Link to={createPageUrl("book-strategy-session")}>Talk to an expert</Link>
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputGroup = ({ label, value, setValue, type }) => (
  <div>
    <label className="text-sm font-medium text-[#C7C7C7]">{label}</label>
    <div className="relative mt-2">
      {type === 'currency' && <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />}
      <Input
        type="number"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className={`bg-[#1A1A1A] border-[#2A2A2A] rounded-xl h-12 ${type === 'currency' || type === 'percent' ? 'pl-9' : 'pl-4'}`}
      />
      {type === 'percent' && <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />}
    </div>
  </div>
);

const SliderGroup = ({ label, value, setValue }) => (
  <div>
    <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm font-medium text-[#C7C7C7]">{label}</label>
        <span className="font-bold text-lg text-white">{value}%</span>
    </div>
    <Slider defaultValue={[value]} max={100} step={1} onValueChange={(val) => setValue(val[0])} 
      className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>span:last-child]:bg-white"
    />
  </div>
);

const OutputCard = ({ label, value, isPrimary = false, isGold = false }) => (
  <div className={`p-6 rounded-xl ${isPrimary ? 'bg-white text-[#0E0E0E]' : 'bg-[#0E0E0E] text-white'} border ${isPrimary ? 'border-transparent' : 'border-[#2A2A2A]'}`}>
    <p className={`text-sm font-medium ${isPrimary ? 'text-[#0E0E0E]/70' : 'text-[#9CA3AF]'}`}>{label}</p>
    <p className={`text-4xl font-bold ${isGold ? 'text-gold-shine' : ''}`}>{value}</p>
  </div>
);