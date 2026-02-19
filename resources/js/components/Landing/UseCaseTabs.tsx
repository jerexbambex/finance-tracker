import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type TabType = 'personal' | 'freelance' | 'family';

const useCases = {
    personal: {
        title: 'Stop wondering where your money went',
        description: 'Take control of your personal finances with automatic tracking and smart insights.',
        features: [
            'Automatic categorization',
            'Budget alerts',
            'Savings goals',
            'Spending insights'
        ]
    },
    freelance: {
        title: 'Manage irregular income like a pro',
        description: 'Handle variable income streams and separate business from personal expenses.',
        features: [
            'Income tracking',
            'Expense separation',
            'Tax planning',
            'Multi-currency support'
        ]
    },
    family: {
        title: 'Get everyone on the same financial page',
        description: 'Coordinate family finances with shared visibility and individual privacy.',
        features: [
            'Shared accounts',
            'Private accounts',
            'Family goals',
            'Kid allowances'
        ]
    }
};

export default function UseCaseTabs() {
    const [activeTab, setActiveTab] = useState<TabType>('personal');

    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Built for how you live
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Whether you're managing personal finances, running a business, or coordinating with family.
                    </p>
                </div>

                {/* Tab Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {(Object.keys(useCases) as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                activeTab === tab
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'bg-background border border-border hover:border-primary/50'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Finance
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border rounded-2xl p-8 md:p-12"
                >
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        {useCases[activeTab].title}
                    </h3>
                    <p className="text-muted-foreground mb-8 text-lg">
                        {useCases[activeTab].description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {useCases[activeTab].features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                <span className="text-foreground">{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
