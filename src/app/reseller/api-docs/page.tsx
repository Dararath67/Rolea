'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  BookOpen,
  Zap,
  Globe,
  DollarSign,
  Key,
  ExternalLink,
  ChevronRight,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Mail,
  LayoutDashboard
} from 'lucide-react';

interface ApiEndpointStep {
  id: number;
  title: string;
  titleKm: string;
  method: 'GET' | 'POST' | 'DONE';
  description: string;
  descriptionKm: string;
  endpoint?: string;
  parameters?: Record<string, string>;
  example_request?: Record<string, any>;
  example_response_success?: Record<string, any>;
  example_response_failure?: Record<string, any>;
  key_rules?: string[];
  key_rules_km?: string[];
  final?: boolean;
}

export default function ResellerApiDocsPage() {
  const { language } = useLanguage();
  const isKm = language === 'km';

  const [baseUrl, setBaseUrl] = useState<string>('');
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'php' | 'node'>('curl');
  const [activeResTab, setActiveResTab] = useState<'ok' | 'err'>('ok');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Tester State
  const [liveTesting, setLiveTesting] = useState<boolean>(false);
  const [liveTestResponse, setLiveTestResponse] = useState<any | null>(null);
  const [liveTestError, setLiveTestError] = useState<string | null>(null);

  // Dynamic Base URL & Reseller API Key detection from current website
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      const token = localStorage.getItem('rolea_token') || localStorage.getItem('rothz_token') || '';
      if (token) {
        fetch('/api/v1/reseller/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.api_keys) {
            const activeKey = data.data.api_keys.find((k: any) => k.is_active);
            if (activeKey) {
              setUserApiKey(activeKey.api_key);
            }
          }
        })
        .catch(() => {});
      }
    }
  }, []);

  // Hash route handler (#step-1, #step-2, etc.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#step-(\d+)$/);
      if (match) {
        const stepNum = parseInt(match[1], 10);
        if (stepNum >= 1 && stepNum <= 6) {
          setActiveStepId(stepNum);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleStepChange = (id: number) => {
    setActiveStepId(id);
    window.location.hash = `#step-${id}`;
    setLiveTestResponse(null);
    setLiveTestError(null);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Specification API Data matching bay2game structure with RoleaTopup real endpoints
  const steps: ApiEndpointStep[] = [
    {
      id: 1,
      title: "Get Reseller Profile",
      titleKm: "ពិនិត្យព័ត៌មាន និងតុល្យភាពកាបូបលុយ (Profile & Balance)",
      method: "GET",
      description: "Retrieve merchant profile information including wallet balance, total B2B orders, active API keys, and estimated wholesale profit margin.",
      descriptionKm: "ទាញយកព័ត៌មានលម្អិតរបស់អាខោន Reseller ដូចជាតុល្យភាពទឹកប្រាក់ កម្រៃជើងសារដែលបានប៉ាន់ស្មាន ចំនួនប័ណ្ណ API Key សកម្ម និងចំនួនប្រតិបត្តិការសរុប។",
      endpoint: "/api/v1/reseller/overview",
      parameters: {
        "X-API-Key": "string (required) - Merchant API Key header (e.g., rt_live_987654321)",
        "Authorization": "string (optional) - Bearer token alternative (e.g., Bearer rt_live_987654321)"
      },
      example_request: {
        headers: {
          "X-API-Key": "rt_live_demo987654321"
        }
      },
      example_response_success: {
        "success": true,
        "data": {
          "wallet_usd": 150.50,
          "est_profit_usd": 22.58,
          "active_api_keys_count": 2,
          "b2b_orders_count": 48,
          "api_keys": [
            {
              "id": "key_8921a",
              "key": "rt_live_demo987654321",
              "label": "Main Web Store",
              "is_active": true,
              "created_at": "2026-09-24T10:00:00Z"
            }
          ]
        }
      },
      example_response_failure: {
        "detail": "Missing or invalid API Key. Provide 'X-API-Key' header."
      },
      key_rules: [
        "API key must be active and whitelisted for your server IP.",
        "Returns available wallet USD balance in real time.",
        "Use this endpoint to verify float funds before initiating automated orders."
      ],
      key_rules_km: [
        "កូដ API Key ត្រូវតែមានសកម្មភាព និងត្រូវអនុញ្ញាត IP របស់ Server របស់អ្នក។",
        "បង្វិលសងទិន្នន័យតុល្យភាពទឹកប្រាក់ Real time គិតជាដុល្លារ (USD)។",
        "ប្រើ endpoint នេះដើម្បពិនិត្យមើលលុយក្នុងកាបូបមុនពេលធ្វើការបញ្ជាទិញស្វ័យប្រវត្តិ។"
      ]
    },
    {
      id: 2,
      title: "Get All Active Games",
      titleKm: "ទាញយកបញ្ជីហ្គេមទាំងអស់ (Get All Games)",
      method: "GET",
      description: "Retrieve all available top-up game categories and titles. Returns game slugs, display names, category tags, and active status for store display.",
      descriptionKm: "ទាញយកបញ្ជីហ្គេមដែលកំពុងដំណើរការទាំងអស់លើប្រព័ន្ធ រួមមាន Slug, ឈ្មោះហ្គេម និងប្រភេទទំនិញ សម្រាប់បង្ហាញលើគេហទំព័រ ឬ Bot របស់អ្នក។",
      endpoint: "/api/v1/reseller/games",
      parameters: {
        "category": "string (optional) - Filter by category (e.g. mobile, pc, voucher)",
        "search": "string (optional) - Search game by name or slug"
      },
      example_request: {},
      example_response_success: {
        "ok": true,
        "reseller": {
          "name": "B2B Partner Store",
          "balance": 150.50
        },
        "games": [
          { "slug": "free-fire-my-sg", "name": "Free Fire (KH/MY/SG)" },
          { "slug": "mobile-legends", "name": "Mobile Legends: Bang Bang" },
          { "slug": "pubg-mobile", "name": "PUBG Mobile Global" },
          { "slug": "honor-of-kings", "name": "Honor of Kings" }
        ]
      },
      example_response_failure: {
        "detail": "Failed to fetch active games list."
      },
      key_rules: [
        "Publicly queryable or scoped to reseller account.",
        "Returns exact game slugs required for querying product packages.",
        "Use `slug` field when requesting offers and creating orders."
      ],
      key_rules_km: [
        "អាចទាញយកទិន្នន័យបានយ៉ាងរហ័សដោយមិនចាំបាច់មានការស្មុគស្មាញ។",
        "ផ្តល់ជូន `slug` ផ្លូវការដែលត្រូវការជាចាំបាច់សម្រាប់ទាញយកកញ្ចប់ផលិតផល។",
        "ប្រើ `slug` នេះនៅពេលស្វែងរកកញ្ចប់ទំនិញ និងបង្កើត Order។"
      ]
    },
    {
      id: 3,
      title: "Get Products by Game",
      titleKm: "ទាញយកកញ្ចប់ទំនិញ និងតម្លៃបោះដុំ (Get Products & Wholesale Prices)",
      method: "GET",
      description: "Retrieve wholesale reseller packages for a specific game. Includes offer IDs, product SKUs, wholesale reseller prices (priceUsd), retail shop prices, and estimated profit margins.",
      descriptionKm: "ទាញយកកញ្ចប់ពេជ្រ/កាតហ្គេម និងតម្លៃបោះដុំ Reseller (priceUsd) ព្រមទាំងតម្លៃលក់រាយ (retailUsd) សម្រាប់គណនាប្រាក់ចំណេញ។",
      endpoint: "/api/v1/reseller/offers/free-fire-my-sg",
      parameters: {
        "game_slug": "string (path required) - Unique game identifier (e.g., free-fire-my-sg, mobile-legends)"
      },
      example_request: {
        "game_slug": "free-fire-my-sg"
      },
      example_response_success: {
        "ok": true,
        "offers": [
          {
            "offerId": "ff-25-dia",
            "sku": "SKU-FF-25",
            "name": "25 Diamonds (Instant Direct)",
            "priceUsd": 0.22,
            "retailUsd": 0.25,
            "profitUsd": 0.03
          },
          {
            "offerId": "ff-100-dia",
            "sku": "SKU-FF-100",
            "name": "100 Diamonds (Instant Direct)",
            "priceUsd": 0.85,
            "retailUsd": 0.99,
            "profitUsd": 0.14
          }
        ]
      },
      example_response_failure: {
        "detail": "Game 'invalid-game-slug' not found."
      },
      key_rules: [
        "priceUsd is the net wholesale price deducted from your reseller wallet.",
        "retailUsd is the recommended customer retail price.",
        "Only active and available packages are listed."
      ],
      key_rules_km: [
        "priceUsd ជាតម្លៃដើមបោះដុំដែលប្រព័ន្ធនឹងកាត់ចេញពីកាបូបលុយរបស់អ្នក។",
        "retailUsd ជាតម្លៃលក់រាយដែលណែនាំឲ្យលក់ជូនអតិថិជន។",
        "បង្ហាញតែត្រឹមកញ្ចប់ទំនិញដែលមានស្តុក និងដំណើរការស្វ័យប្រវត្តិប៉ុណ្ណោះ។"
      ]
    },
    {
      id: 4,
      title: "Check Player Account (Gamer ID)",
      titleKm: "ផ្ទៀងផ្ទាត់ឈ្មោះ និង ID ហ្គេមរបស់អតិថិជន (Verify Player ID & Name)",
      method: "GET",
      description: "Verify gamer Player ID and Zone/Server ID in real-time before placing order. Returns confirmed in-game nickname to prevent wrong account top-ups.",
      descriptionKm: "ពិនិត្យមើល ID ហ្គេម និង Server ID របស់អតិថិជនជាមុន ដើម្បីទទួលបានឈ្មោះក្នុងហ្គេម (In-game Nickname) ការពារការបញ្ចូលខុសអាខោន។",
      endpoint: "/api/v1/gamer/check",
      parameters: {
        "game": "string (required) - Game slug (e.g. mlbb, freefire)",
        "userid": "string (required) - Player ID number (e.g. 262856740)",
        "serverid": "string (optional) - Server or Zone ID (e.g. 3543 for MLBB)"
      },
      example_request: {
        "game": "mlbb",
        "userid": "262856740",
        "serverid": "3543"
      },
      example_response_success: {
        "valid": true,
        "verified": true,
        "username": "ProGamer_KH",
        "game": "Mobile Legends",
        "user_id": "262856740",
        "zone_id": "3543",
        "message": "Player ID verified successfully."
      },
      example_response_failure: {
        "valid": false,
        "verified": false,
        "message": "Invalid Player ID or Server ID combination."
      },
      key_rules: [
        "Supports major titles: MLBB, Free Fire, PUBG Mobile, Honor of Kings.",
        "Prevents customer order disputes by validating nickname first.",
        "Executes live server API lookup in milliseconds."
      ],
      key_rules_km: [
        "គាំទ្រការផ្ទៀងផ្ទាត់ហ្គេមល្បីៗជាច្រើនដូចជា MLBB, Free Fire, PUBG Mobile។",
        "ការពារជម្លោះអតិថិជនដោយបង្ហាញឈ្មោះក្នុងហ្គេមត្រឹមត្រូវមុននឹងកាត់លុយ។",
        "ដំណើរការស្វែងរកឈ្មោះផ្ទាល់ពី Server ហ្គេមក្នុងរយៈពេលប៉ុន្មានមិល្លីវិនាទី។"
      ]
    },
    {
      id: 5,
      title: "Create Direct Top-Up Order",
      titleKm: "បញ្ជាទិញហ្គេមស្វ័យប្រវត្តិ (Create Automated Order)",
      method: "POST",
      description: "Execute immediate automated top-up order. Deducts wholesale cost from reseller wallet, dispatches to provider engine, and returns instant delivery status.",
      descriptionKm: "កាត់លុយបោះដុំពីកាបូបលុយ ហើយបញ្ចូលហ្គេមជូនអតិថិជនភ្លាមៗ 24/7 ដោយស្វ័យប្រវត្តិពេញលេញ។",
      endpoint: "/api/v1/reseller/order",
      parameters: {
        "X-API-Key": "string (header required) - Merchant API key",
        "gameSlug": "string (required) - Target game identifier",
        "offerId": "string (required) - Offer or Package ID",
        "playerId": "string (required) - Customer Player ID",
        "serverId": "string (optional) - Server/Zone ID if required",
        "customerEmail": "string (optional) - Customer email for receipt"
      },
      example_request: {
        "gameSlug": "free-fire-my-sg",
        "offerId": "ff-25-dia",
        "playerId": "1234567890",
        "serverId": "",
        "customerEmail": "customer@example.com"
      },
      example_response_success: {
        "ok": true,
        "order": {
          "orderNumber": "RT-8A9C12E4",
          "status": "DELIVERED"
        }
      },
      example_response_failure: {
        "detail": "Insufficient wallet balance. Cost: $0.22, Wallet Balance: $0.05"
      },
      key_rules: [
        "Wallet balance must be sufficient for the wholesale offer cost.",
        "Order execution completes instantly with automated provider fallback.",
        "Response returns orderNumber for tracking and delivery status confirmation."
      ],
      key_rules_km: [
        "តុល្យភាពទឹកប្រាក់ក្នុងកាបូបត្រូវតែគ្រប់គ្រាន់ទៅតាមតម្លៃបោះដុំ។",
        "ការបញ្ជាទិញត្រូវបានបំពេញភ្លាមៗ និងមានប្រព័ន្ធ Auto-Fallback ការពារបរាជ័យ។",
        "បង្វិលសងលេខ Order (orderNumber) និងស្ថានភាព (DELIVERED) ភ្លាមៗ។"
      ]
    },
    {
      id: 6,
      title: "Final Integration & Go Live",
      titleKm: "បញ្ចប់ការតភ្ជាប់ និងដំណើរការលក់ផ្លូវការ (Integration Complete)",
      method: "DONE",
      final: true,
      description: "Congratulations! Your API integration is complete and ready for live production environment.",
      descriptionKm: "អបអរសាទរ! ការតភ្ជាប់ប្រព័ន្ធ API របស់អ្នកបានរួចរាល់ 100% និងជាស្ថាពរ។",
      key_rules: [
        "Production API key active and secured.",
        "Reseller wallet float balance funded.",
        "Automated top-up callback hooks configured.",
        "Ready to accept live orders from your customers 24/7."
      ],
      key_rules_km: [
        "កូដ API Key ផ្លូវការត្រូវបានបង្កើត និងការពារយ៉ាងមានសុវត្ថិភាព។",
        "បានដាក់ប្រាក់ចូលកាបូបលុយ Reseller សម្រាប់ដំណើរការស្វ័យប្រវត្តិ។",
        "បានរៀបចំ Webhook callback សម្រាប់ទទួលដំណឹងផ្លាស់ប្តូរស្ថានភាព។",
        "រួចរាល់ក្នុងការលក់ជូនអតិថិជន 24 ម៉ោងលើ 24 ម៉ោង។"
      ]
    }
  ];

  const currentStep = steps.find(s => s.id === activeStepId) || steps[0];

  // Helper code snippet generators
  const getCurlCode = (step: ApiEndpointStep) => {
    if (step.final) return "";
    const fullUrl = `${baseUrl}${step.endpoint}`;
    const keyStr = userApiKey || "YOUR_API_KEY";
    if (step.method === 'GET') {
      return `curl -X GET "${fullUrl}" \\
  -H "X-API-Key: ${keyStr}" \\
  -H "Accept: application/json"`;
    }
    const bodyStr = JSON.stringify(step.example_request || {}, null, 2);
    return `curl -X POST "${fullUrl}" \\
  -H "X-API-Key: ${keyStr}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${bodyStr}'`;
  };

  const getPythonCode = (step: ApiEndpointStep) => {
    if (step.final) return "";
    const fullUrl = `${baseUrl}${step.endpoint}`;
    const keyStr = userApiKey || "YOUR_API_KEY";
    if (step.method === 'GET') {
      return `import requests

url = "${fullUrl}"
headers = {
    "X-API-Key": "${keyStr}",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers, timeout=15)
print("Status:", response.status_code)
print(response.json())`;
    }
    const bodyStr = JSON.stringify(step.example_request || {}, null, 4);
    return `import requests

url = "${fullUrl}"
headers = {
    "X-API-Key": "${keyStr}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}
payload = ${bodyStr}

response = requests.post(url, json=payload, headers=headers, timeout=15)
print("Status:", response.status_code)
print(response.json())`;
  };

  const getPhpCode = (step: ApiEndpointStep) => {
    if (step.final) return "";
    const fullUrl = `${baseUrl}${step.endpoint}`;
    const keyStr = userApiKey || "YOUR_API_KEY";
    if (step.method === 'GET') {
      return `<?php
$apiKey = "${keyStr}";
$url = "${fullUrl}";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        "X-API-Key: " . $apiKey,
        "Accept: application/json"
    ]
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
    }
    const bodyStr = JSON.stringify(step.example_request || {}, null, 4);
    return `<?php
$apiKey = "${keyStr}";
$url = "${fullUrl}";
$payload = json_encode(${bodyStr});

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        "X-API-Key: " . $apiKey,
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_POSTFIELDS     => $payload
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
  };

  const getNodeCode = (step: ApiEndpointStep) => {
    if (step.final) return "";
    const fullUrl = `${baseUrl}${step.endpoint}`;
    const keyStr = userApiKey || "YOUR_API_KEY";
    if (step.method === 'GET') {
      return `const apiKey = "${keyStr}";
const url = "${fullUrl}";

const res = await fetch(url, {
  method: "GET",
  headers: {
    "X-API-Key": apiKey,
    "Accept": "application/json"
  }
});

const data = await res.json();
console.log(data);`;
    }
    const bodyStr = JSON.stringify(step.example_request || {}, null, 2);
    return `const apiKey = "${keyStr}";
const url = "${fullUrl}";

const res = await fetch(url, {
  method: "POST",
  headers: {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify(${bodyStr})
});

const data = await res.json();
console.log(data);`;
  };

  const getActiveCode = (step: ApiEndpointStep) => {
    switch (activeCodeTab) {
      case 'curl': return getCurlCode(step);
      case 'python': return getPythonCode(step);
      case 'php': return getPhpCode(step);
      case 'node': return getNodeCode(step);
    }
  };

  // Live test execution function
  const handleRunLiveTest = async () => {
    if (!currentStep.endpoint) return;
    setLiveTesting(true);
    setLiveTestResponse(null);
    setLiveTestError(null);

    try {
      const fullUrl = `${baseUrl}${currentStep.endpoint}`;
      const options: RequestInit = {
        method: currentStep.method === 'POST' ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'rt_live_demo987654321'
        }
      };

      if (currentStep.method === 'POST' && currentStep.example_request) {
        options.body = JSON.stringify(currentStep.example_request);
      }

      const res = await fetch(fullUrl, options);
      const json = await res.json();
      setLiveTestResponse({
        status: res.status,
        statusText: res.statusText,
        data: json
      });
    } catch (err: any) {
      setLiveTestError(err.message || 'Failed to reach API server');
    } finally {
      setLiveTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-slate-700 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/reseller" className="hover:text-white flex items-center gap-1 font-medium transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isKm ? 'ត្រឡប់ទៅផ្ទាំងដៃគូលក់បន្ត' : 'Reseller Dashboard'}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-bold">{isKm ? 'ឯកសារ API ផ្លូវការ' : 'Developer API Docs'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold text-emerald-400">REST API v2.1 (Live Engine)</span>
          </div>
        </div>

        {/* HERO INTRO SECTION */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-white mb-2">
              DOCUMENTATION
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              RoleaTopup B2B Reseller API
            </h1>
            <p className="mt-2.5 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {isKm
                ? 'តភ្ជាប់ប្រព័ន្ធទិញហ្គេមស្វ័យប្រវត្តិ 24/7 ចូលទៅកាន់គេហទំព័រ ឬ Telegram/Discord Bot របស់អ្នក។ មួយ REST API គាំទ្រ 200+ ហ្គេម ជាមួយនឹងតម្លៃបោះដុំខ្ពស់បំផុត និងការបញ្ចូលភ្លាមៗ។'
                : 'Integrate automated game top-ups into your own store or bot. One REST API covers 200+ games across all regions and servers, with wholesale pricing and instant delivery.'}
            </p>

            {/* Feature Badges Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">200+ Games</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Wholesale Price</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Secure & Trusted</span>
              </div>
            </div>

            {/* Base URL & Auth Info Banner */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  API BASE URL
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <code className="font-mono text-xs font-bold text-white break-all">
                    {baseUrl}
                  </code>
                  <button
                    onClick={() => handleCopy(baseUrl, 'baseUrl')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'baseUrl' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'baseUrl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                  AUTHENTICATION METHOD
                </p>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {isKm
                    ? 'រាល់ការហៅ API ត្រូវតែរួមបញ្ចូលក្បាលម៉ាស៊ីន '
                    : 'Every request requires an '}
                  <code className="rounded bg-slate-900 border border-slate-700 px-1.5 py-0.5 font-mono text-[11px] text-white">
                    X-API-Key
                  </code>
                  {isKm
                    ? '។ អ្នកអាចបង្កើត API Key បានក្នុង '
                    : ' header. Manage your keys in '}
                  <Link href="/reseller" className="font-bold text-white hover:underline">
                    {isKm ? 'ផ្ទាំង Reseller Dashboard' : 'Reseller Dashboard'}
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN INTERACTIVE STEP-BY-STEP LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR ENDPOINTS NAVIGATION */}
          <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white mb-3">
                ENDPOINTS ({steps.length})
              </p>
              
              <nav className="space-y-1.5">
                {steps.map((p, idx) => {
                  const isActive = p.id === activeStepId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleStepChange(p.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left font-medium transition-all ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-lg font-black'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                            isActive
                              ? 'bg-slate-950 text-white'
                              : p.method === 'GET'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : p.method === 'POST'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {p.method}
                        </span>
                        <span className="truncate text-xs">
                          {idx + 1}. {isKm ? p.titleKm.split(' (')[0] : p.title}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Get API Key Quick Box */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Key className="w-3.5 h-3.5 text-white" />
                  <span>{isKm ? 'ត្រូវការ API Key?' : 'Need an API Key?'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {isKm
                    ? 'បង្កើត API Key និងកំណត់ IP Whitelist បានយ៉ាងងាយស្រួល។'
                    : 'Generate live API keys with IP security guard.'}
                </p>
                <Link
                  href="/reseller"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  <span>{isKm ? 'បង្កើត API Key ឥឡូវនេះ' : 'Generate API Key'}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN STEP DETAIL PANEL */}
          <section className="flex-1 min-w-0">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              {/* STEP HEADER */}
              <div className="border-b border-slate-800 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                        currentStep.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : currentStep.method === 'POST'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {currentStep.method}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {currentStep.id}. {isKm ? currentStep.titleKm : currentStep.title}
                    </h2>
                  </div>

                  {!currentStep.final && (
                    <button
                      onClick={handleRunLiveTest}
                      disabled={liveTesting}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
                    >
                      {liveTesting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current text-slate-950" />
                      )}
                      <span>{liveTesting ? (isKm ? 'កំពុងសាកល្បង...' : 'Testing...') : (isKm ? 'សាកល្បង Live API' : 'Test Live API')}</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed mt-2">
                  {isKm ? currentStep.descriptionKm : currentStep.description}
                </p>

                {/* ENDPOINT URL BOX */}
                {currentStep.endpoint && (
                  <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-2 overflow-x-auto text-slate-200">
                      <span className="text-slate-500 font-bold uppercase">ENDPOINT:</span>
                      <span className="text-white font-bold break-all font-mono">
                        {baseUrl}{currentStep.endpoint}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`${baseUrl}${currentStep.endpoint}`, 'ep_' + currentStep.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'ep_' + currentStep.id ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === 'ep_' + currentStep.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* IF FINAL STEP - SHOW GO LIVE CHECKLIST */}
              {currentStep.final ? (
                <div className="space-y-6 py-2">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white mb-4">
                      GO LIVE CHECKLIST
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(isKm ? currentStep.key_rules_km : currentStep.key_rules)?.map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 font-medium leading-relaxed">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DEVELOPER SUPPORT CARDS */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                      DEVELOPER SUPPORT & RESOURCES
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <a
                        href="https://t.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-white/40 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">Telegram Support</p>
                          <p className="text-[11px] text-slate-400">24/7 Tech Assistant</p>
                        </div>
                      </a>

                      <a
                        href="mailto:support@roleatopup.com"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-white/40 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">Email Support</p>
                          <p className="text-[11px] text-slate-400">Official Tech Help</p>
                        </div>
                      </a>

                      <Link
                        href="/reseller"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-white/40 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">Reseller Hub</p>
                          <p className="text-[11px] text-slate-400">Manage Keys & Wallet</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* REGULAR ENDPOINT PARAMETERS, CODE EXAMPLES & RESPONSES */
                <>
                  {/* PARAMETERS TABLE */}
                  {currentStep.parameters && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                        PARAMETERS
                      </p>
                      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10.5px] uppercase">
                              <th className="p-3.5 pl-4">Name</th>
                              <th className="p-3.5">Type</th>
                              <th className="p-3.5">Rule</th>
                              <th className="p-3.5 pr-4">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {Object.entries(currentStep.parameters).map(([name, desc]) => {
                              const isReq = /required/i.test(desc);
                              const type = (desc.match(/^(\w+)/) || ['string'])[0];
                              const cleanDesc = desc.replace(/^\w+\s*\([^)]*\)\s*-\s*/, '');
                              return (
                                <tr key={name} className="hover:bg-slate-900/40">
                                  <td className="p-3.5 pl-4 font-mono font-bold text-white whitespace-nowrap">{name}</td>
                                  <td className="p-3.5 font-mono text-slate-400">{type}</td>
                                  <td className="p-3.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isReq ? 'bg-red-950/80 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-400'}`}>
                                      {isReq ? 'REQUIRED' : 'OPTIONAL'}
                                    </span>
                                  </td>
                                  <td className="p-3.5 pr-4 text-slate-300 leading-relaxed">{cleanDesc}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CODE EXAMPLES SWITCHER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                        CODE EXAMPLES
                      </p>
                      <button
                        onClick={() => handleCopy(getActiveCode(currentStep), 'code_' + currentStep.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors flex items-center gap-1"
                      >
                        {copiedKey === 'code_' + currentStep.id ? (
                          <Check className="w-3 h-3 text-white" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === 'code_' + currentStep.id ? 'Copied Code' : 'Copy Code'}</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                      {/* Code Tabs Header */}
                      <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
                        {(['curl', 'python', 'php', 'node'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveCodeTab(tab)}
                            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                              activeCodeTab === tab
                                ? 'bg-white text-slate-950 font-black shadow'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {tab === 'curl' ? 'cURL' : tab === 'python' ? 'Python' : tab === 'php' ? 'PHP' : 'Node.js'}
                          </button>
                        ))}
                      </div>

                      {/* Code Snippet Box */}
                      <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[360px] leading-relaxed">
                        <pre>{getActiveCode(currentStep)}</pre>
                      </div>
                    </div>
                  </div>

                  {/* LIVE API RESPONSE OR TEST RESULT */}
                  {liveTestResponse || liveTestError ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>LIVE TEST RESPONSE</span>
                        </p>
                        <button
                          onClick={() => {
                            setLiveTestResponse(null);
                            setLiveTestError(null);
                          }}
                          className="text-[11px] font-mono text-slate-400 hover:text-white underline"
                        >
                          Clear Result
                        </button>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-black border border-emerald-900/60 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[300px]">
                        {liveTestError ? (
                          <div className="text-red-400 font-bold">{liveTestError}</div>
                        ) : (
                          <pre>{JSON.stringify(liveTestResponse?.data, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* STATIC EXAMPLE RESPONSES SWITCHER */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                          EXAMPLE RESPONSE
                        </p>
                        <button
                          onClick={() => handleCopy(
                            JSON.stringify(
                              activeResTab === 'ok'
                                ? currentStep.example_response_success
                                : currentStep.example_response_failure,
                              null,
                              2
                            ),
                            'res_' + currentStep.id
                          )}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          {copiedKey === 'res_' + currentStep.id ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedKey === 'res_' + currentStep.id ? 'Copied' : 'Copy Response'}</span>
                        </button>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                        {/* Response Tabs Header */}
                        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
                          <button
                            onClick={() => setActiveResTab('ok')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                              activeResTab === 'ok'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>Success (200 OK)</span>
                          </button>

                          <button
                            onClick={() => setActiveResTab('err')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                              activeResTab === 'err'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            <span>Failed (Error)</span>
                          </button>
                        </div>

                        {/* Response JSON Box */}
                        <div className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[300px] leading-relaxed bg-black">
                          <pre>
                            {JSON.stringify(
                              activeResTab === 'ok'
                                ? currentStep.example_response_success
                                : currentStep.example_response_failure,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KEY RULES CHECKLIST */}
                  {currentStep.key_rules && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                        KEY RULES & INTEGRATION NOTES
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {(isKm ? currentStep.key_rules_km : currentStep.key_rules)?.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-300 font-medium leading-relaxed">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP PAGER NAVIGATION */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                {activeStepId > 1 ? (
                  <button
                    onClick={() => handleStepChange(activeStepId - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ថយក្រោយ' : 'Previous Step'}</span>
                  </button>
                ) : <div />}

                <span className="text-xs font-mono font-bold text-slate-500">
                  {activeStepId} / {steps.length}
                </span>

                {activeStepId < steps.length ? (
                  <button
                    onClick={() => handleStepChange(activeStepId + 1)}
                    className="px-4.5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-lg"
                  >
                    <span>{isKm ? 'បន្ទាប់' : 'Next Step'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                ) : <div />}
              </div>

            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
