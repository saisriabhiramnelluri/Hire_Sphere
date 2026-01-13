import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoSave, IoAdd, IoTrash } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import FadeIn from '../../components/animations/FadeIn';
import toast from 'react-hot-toast';

const EligibilityRules = () => {
  const [globalRules, setGlobalRules] = useState({
    oneOfferPolicy: true,
    maxApplicationsPerStudent: 10,
    minCGPAForPlacement: 6.0,
    cooldownPeriodDays: 7,
  });

  const [ctcBasedRules, setCtcBasedRules] = useState([
    { minCTC: 0, maxCTC: 5, maxApplications: 15, description: 'Low CTC Range' },
    { minCTC: 5, maxCTC: 10, maxApplications: 10, description: 'Medium CTC Range' },
    { minCTC: 10, maxCTC: 999, maxApplications: 5, description: 'High CTC Range' },
  ]);

  const handleGlobalRuleChange = (field, value) => {
    setGlobalRules((prev) => ({ ...prev, [field]: value }));
  };

  const handleCtcRuleChange = (index, field, value) => {
    const updated = [...ctcBasedRules];
    updated[index][field] = value;
    setCtcBasedRules(updated);
  };

  const addCtcRule = () => {
    setCtcBasedRules([
      ...ctcBasedRules,
      { minCTC: 0, maxCTC: 0, maxApplications: 0, description: '' },
    ]);
  };

  const removeCtcRule = (index) => {
    setCtcBasedRules(ctcBasedRules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast.success('Eligibility rules saved successfully');
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Eligibility Rules</h1>
          <p className="text-primary-600 mt-1">Configure placement eligibility criteria</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card title="Global Placement Rules">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="font-medium text-primary-900">One Offer Policy</p>
                <p className="text-sm text-primary-600">
                  Students can accept only one offer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalRules.oneOfferPolicy}
                  onChange={(e) => handleGlobalRuleChange('oneOfferPolicy', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Maximum Applications Per Student"
                type="number"
                value={globalRules.maxApplicationsPerStudent}
                onChange={(e) =>
                  handleGlobalRuleChange('maxApplicationsPerStudent', parseInt(e.target.value))
                }
              />
              <Input
                label="Minimum CGPA for Placement"
                type="number"
                step="0.01"
                value={globalRules.minCGPAForPlacement}
                onChange={(e) =>
                  handleGlobalRuleChange('minCGPAForPlacement', parseFloat(e.target.value))
                }
              />
              <Input
                label="Cooldown Period (Days)"
                type="number"
                value={globalRules.cooldownPeriodDays}
                onChange={(e) =>
                  handleGlobalRuleChange('cooldownPeriodDays', parseInt(e.target.value))
                }
                helperText="Days between consecutive applications"
              />
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card title="CTC-Based Application Limits">
          <div className="space-y-4">
            {ctcBasedRules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-primary-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <Input
                    placeholder="Description"
                    value={rule.description}
                    onChange={(e) => handleCtcRuleChange(index, 'description', e.target.value)}
                    className="flex-1 mr-4"
                  />
                  <button
                    onClick={() => removeCtcRule(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <IoTrash size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Min CTC (LPA)"
                    type="number"
                    step="0.01"
                    value={rule.minCTC}
                    onChange={(e) => handleCtcRuleChange(index, 'minCTC', parseFloat(e.target.value))}
                  />
                  <Input
                    label="Max CTC (LPA)"
                    type="number"
                    step="0.01"
                    value={rule.maxCTC}
                    onChange={(e) => handleCtcRuleChange(index, 'maxCTC', parseFloat(e.target.value))}
                  />
                  <Input
                    label="Max Applications"
                    type="number"
                    value={rule.maxApplications}
                    onChange={(e) =>
                      handleCtcRuleChange(index, 'maxApplications', parseInt(e.target.value))
                    }
                  />
                </div>
              </motion.div>
            ))}
            <Button type="button" variant="secondary" onClick={addCtcRule} icon={<IoAdd />}>
              Add CTC Rule
            </Button>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="flex justify-end">
          <Button onClick={handleSave} icon={<IoSave />}>
            Save Rules
          </Button>
        </div>
      </FadeIn>
    </div>
  );
};

export default EligibilityRules;
