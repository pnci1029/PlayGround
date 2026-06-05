// Shared application state — mutated by all other modules
let allRows      = [];
let displayRows  = [];
let curMkt       = 'ALL';
let sortCol      = 'market_cap';
let sortAsc      = false;
let logic        = 'AND';
let condId       = 0;
let screening    = false;
let strategies   = {};
let selectedStrat = null;
let stratPanelOpen = false;

const FIELDS = [
  { v: 'price',       l: '가격'      },
  { v: 'change_pct',  l: '등락률 %'  },
  { v: 'market_cap',  l: '시가총액'  },
  { v: 'per',         l: 'PER'       },
  { v: 'pbr',         l: 'PBR'       },
  { v: 'roe',         l: 'ROE %'     },
  { v: 'eps',         l: 'EPS'       },
  { v: 'div_yield',   l: '배당수익률'},
  { v: 'week52_high', l: '52W 고가'  },
  { v: 'week52_low',  l: '52W 저가'  },
  { v: 'volume',      l: '거래량'    },
];
