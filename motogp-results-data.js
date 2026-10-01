/* Datos de MotoGP obtenidos de publicaciones oficiales; los campos no incluidos siguen pendientes. */
window.MOTOGP_OFFICIAL_RESULTS={
  season:2026,
  updatedAt:"2026-10-01",
  currentStandings:{
    afterRound:15,
    updatedAt:"2026-09-20",
    sourceUrl:"https://www.motogp.com/en/news/2026/09/28/vorschau-der-titelkampf-spitzt-sich-zu-wir-fliegen-nach-motegi/1095167",
    ridersSourceUrl:"https://www.motogp.com/en/world-standing/2026/motogp/championship-standings",
    riders:[
      {position:1,name:"Jorge Martín",team:"Aprilia Racing",points:306},
      {position:2,name:"Marc Márquez",team:"Ducati Lenovo Team",points:294},
      {position:3,name:"Marco Bezzecchi",team:"Aprilia Racing",points:264}
    ],
    constructors:[
      {position:1,name:"Aprilia",points:442},
      {position:2,name:"Ducati",points:432},
      {position:3,name:"KTM",points:277}
    ],
    constructorsSourceUrl:"https://www.motogp.com/en/world-standing/2026/motogp/constructor-standings"
  },
  byRound:{
    13:{
      source:"MotoGP.com · clasificación y crónicas oficiales del GP de Aragón",
      sourceUrls:[
        "https://www.motogp.com/en/gp-results/2026/ara/motogp/rac/classification",
        "https://www.motogp.com/en/news/2026/08/27/marc-marquez-retaliates-to-hold-off-alex-marquez-for-aragon-gold/1087036",
        "https://www.motogp.com/en/news/2026/08/30/marc-marquez-fends-off-acosta-and-bezzecchi-to-underline-title-charge-at-aragon/1087037"
      ],
      sessions:{
        Sprint:{classificationType:"podium",rows:[
          {position:1,rider:"Marc Márquez",team:"Ducati Lenovo Team"},
          {position:2,rider:"Álex Márquez",team:"BK8 Gresini Racing MotoGP"},
          {position:3,rider:"Marco Bezzecchi",team:"Aprilia Racing"}
        ]},
        Carrera:{classificationType:"top-results",rows:[
          {position:1,rider:"Marc Márquez",team:"Ducati Lenovo Team",result:"41:10.969",points:25},
          {position:2,rider:"Pedro Acosta",team:"Red Bull KTM Factory Racing",result:"+1.754",points:20},
          {position:3,rider:"Marco Bezzecchi",team:"Aprilia Racing",result:"+3.629",points:16}
        ]}
      },
      race:{winner:"Marc Márquez",podium:["Marc Márquez","Pedro Acosta","Marco Bezzecchi"],pole:"Marco Bezzecchi · 1:44.962",fastestLap:null,retirements:null,safetyCar:null,redFlag:null},
      conditions:{sky:"Despejado",track:"Seco",airTemperatureC:31,groundTemperatureC:51,humidityPercent:34},
      championship:{ridersLeader:"Jorge Martín",leadOverSecondPoints:19}
    },
    14:{
      source:"MotoGP.com · crónicas oficiales del GP de San Marino y la Riviera de Rimini",
      sourceUrls:[
        "https://www.motogp.com/en/gp-results/2026/rsm/motogp/spr/classification",
        "https://www.motogp.com/en/gp-results/2026/rsm/motogp/rac/classification",
        "https://www.motogp.com/es/news/2026/07/16/marc-marquez-capitalises-on-bezzecchi-error-to-seize-title-race-lead/1089345"
      ],
      sessions:{
        Sprint:{classificationType:"podium",rows:[
          {position:1,rider:"Marc Márquez",team:"Ducati Lenovo Team"},
          {position:2,rider:"Marco Bezzecchi",team:"Aprilia Racing"},
          {position:3,rider:"Jorge Martín",team:"Aprilia Racing"}
        ]},
        Carrera:{classificationType:"podium",rows:[
          {position:1,rider:"Marc Márquez",team:"Ducati Lenovo Team"},
          {position:2,rider:"Álex Márquez",team:"BK8 Gresini Racing MotoGP"},
          {position:3,rider:"Pedro Acosta",team:"Red Bull KTM Factory Racing"}
        ]}
      },
      race:{winner:"Marc Márquez",podium:["Marc Márquez","Álex Márquez","Pedro Acosta"],pole:"Marco Bezzecchi",fastestLap:null,retirements:null,safetyCar:null,redFlag:null},
      conditions:null,
      championship:{ridersTiedForLead:["Marc Márquez","Jorge Martín"],leadOverSecondPoints:0}
    },
    15:{
      source:"MotoGP.com · resultados y crónica oficial del GP de Austria",
      sourceUrls:[
        "https://www.motogp.com/en/gp-results/2026/aut/motogp/rac/classification",
        "https://www.motogp.com/en/news/2026/09/17/pedro-acosta-akhiri-penantian-sebagai-pemenang-motogp-di-gp-austria/1090419",
        "https://www.motogp.com/fr/news/2026/09/19/martin-legt-ein-grandioses-comeback-hin-und-nutzt-acostas-fehler-aus/1090418"
      ],
      sessions:{
        Sprint:{
          classificationType:"podium",
          rows:[
            {position:1,rider:"Jorge Martín",team:"Aprilia Racing"},
            {position:2,rider:"Marc Márquez",team:"Ducati Lenovo Team"},
            {position:3,rider:"Marco Bezzecchi",team:"Aprilia Racing"}
          ]
        },
        Carrera:{
          classificationType:"top-results",
          rows:[
            {position:1,rider:"Pedro Acosta",team:"Red Bull KTM Factory Racing",result:"42:16.996",points:25},
            {position:2,rider:"Jorge Martín",team:"Aprilia Racing",result:"+1.017",points:20},
            {position:3,rider:"Marco Bezzecchi",team:"Aprilia Racing",result:"+1.209",points:16}
          ]
        }
      },
      race:{winner:"Pedro Acosta",podium:["Pedro Acosta","Jorge Martín","Marco Bezzecchi"],fastestLap:null,retirements:null,safetyCar:null,redFlag:null},
      conditions:{sky:"Despejado",track:"Seco",airTemperatureC:23,groundTemperatureC:16,humidityPercent:39},
      championship:{ridersLeader:"Jorge Martín",leadOverSecondPoints:12}
    }
  }
};

