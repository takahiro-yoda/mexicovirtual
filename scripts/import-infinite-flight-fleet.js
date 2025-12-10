const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Infinite Flight Community のデータを構造化
// 参考: https://community.infiniteflight.com/t/every-aircraft-and-livery-in-if/777362
const fleetData = {
  'Airbus A220-200 (PRO)': [
    'Air Austral',
    'Air Canada',
    'Air Canada (Retro)',
    'Air France',
    'Air Manas',
    'Air Tanzania',
    'Air Vanuatu',
    'airBaltic',
    'airBaltic (Special)',
    'Airbus',
    'Bombardier',
    'Breeze',
    'Delta Air Lines',
    'EgyptAir',
    'EgyptAir Express',
    'Generic',
    'Ibom Air',
    'Iraqi Airways',
    'JetBlue',
    'Korean Air',
    'Swiss'
  ],
  'Airbus A318-100 (PRO)': [
    'ACJ Livery 1',
    'ACJ Livery 2',
    'ACJ Livery 3',
    'ACJ Livery 4',
    'ACJ Livery 5',
    'Air France',
    'Airbus - New',
    'Airbus - Old',
    'Avianca',
    'British Airways',
    'Frontier',
    'Generic',
    'IF 2015',
    'IF 2018',
    'Mexicana',
    'Tarom'
  ],
  'Airbus A319-100 (PRO)': [
    'Air Berlin',
    'Air Canada',
    'Air Canada Rouge',
    'Air China',
    'Air France',
    'American Airlines',
    'Azerbaijan Airlines',
    'British Airways',
    'Brussels Airlines',
    'Cebu Pacific',
    'Croatia Airlines',
    'Delta Air Lines',
    'Drukair',
    'EasyJet',
    'Eurowings',
    'Generic',
    'LAN',
    'LATAM',
    'Lufthansa',
    'Northwest Airlines',
    'Qatar Airways',
    'S7',
    'SAS (Retro)',
    'Saudia',
    'SilkAir',
    'Swiss',
    'TAM',
    'TAP',
    'TigerAir',
    'Tunisair',
    'Volaris',
    'Volotea Airlines'
  ],
  'Airbus A320-200 (PRO)': [
    'Aegean Airlines',
    'Aegean Airlines 2020',
    'Aer Lingus',
    'Aer Lingus 2019',
    'Aeroflot',
    'Air Asia',
    'Air France',
    'Air India',
    'Air New Zealand',
    'Air Zimbabwe',
    'Alaska Airlines',
    'Allegiant Air',
    'American Airlines',
    'Avianca',
    'Azul',
    'Batik Air',
    'British Airways',
    'Citilink',
    'Delta Air Lines',
    'DutchBird',
    'EasyJet',
    'EasyJet 2015',
    'Edelweiss',
    'Eurowings',
    'Frontier - Alberta and Clipper',
    'Frontier - Colorado',
    'Frontier - Hugh the Manatee',
    'Frontier - Ozzy',
    'Frontier - Sheldon',
    'Generic',
    'IndiGo',
    'IF Pride 2022',
    'ITA Transportes Aéros',
    'JetBlue',
    'JetBlue Shantay',
    'JetSMART',
    'JetStar',
    'LATAM',
    'Libyan Airlines',
    'Lufthansa',
    'Lufthansa 2018',
    'Peach Aviation',
    'QantasLink',
    'SAS',
    'Sky Airlines',
    'Spirit',
    'TAP',
    'United Airlines',
    'US Airways',
    'Virgin America',
    'Vistara',
    'VivaAerobus',
    'Vueling',
    'Wizz Air',
    'WOW Air'
  ],
  'Airbus A321-200 (Free)': [
    'Aer Lingus',
    'Air Canada',
    'Air India',
    'Alitalia',
    'American Airlines',
    'ANA',
    'Asiana Airlines',
    'Austrian Airlines',
    'British Airways',
    'Cebu Pacific',
    'Delta Air Lines',
    'Dragonair',
    'Etihad',
    'Etihad 2015',
    'EVA Air',
    'Finnair',
    'Frontier - Virginia the Wolf',
    'Generic',
    'Gulf Air',
    'Iberia',
    'JetBlue',
    'LATAM',
    'Middle East Airlines',
    'Qatar Airways',
    'Spirit Airlines',
    'Swiss',
    'Thomas Cook',
    'Turkish Airlines',
    'VietJet Air',
    'Vietnam Airlines',
    'Wizz Air'
  ],
  'Airbus A330-200F (PRO) (LEGACY)': [
    'Etihad Cargo',
    'Turkish Airlines Cargo',
    'UPS'
  ],
  'Airbus A330-300 (PRO)': [
    'Aer Lingus',
    'Aeroflot',
    'Air Canada',
    'Air China',
    'Air Transat',
    'Avianca',
    'Brussels Airlines',
    'Cathay Pacific',
    'Cebu Pacific',
    'China Airlines',
    'China Southern',
    'Delta Air Lines',
    'Edelweiss Air',
    'EgyptAir',
    'Finnair',
    'Generic',
    'Hainan Airlines',
    'Iberia',
    'Jet Airways',
    'KLM',
    'Lufthansa',
    'Oman Air',
    'Qantas',
    'RwandAir',
    'SAS',
    'Saudia',
    'Singapore Airlines',
    'South African Airways',
    'Srilankan Airlines',
    'Swiss International Air Lines',
    'Thai International Airways',
    'Turkish Airlines',
    'Virgin Atlantic'
  ],
  'Airbus A330-900neo (PRO)': [
    'Air Belgium',
    'Air Mauritius',
    'Air Senegal',
    'AirAsiaX',
    'Airbus',
    'Aircalin',
    'Azul',
    'Azul Rosa',
    'Citilink',
    'Corsair',
    'Delta Airlines',
    'Generic',
    'HiFly',
    'Iberojet',
    'LionAir',
    'TAP'
  ],
  'Airbus A340-600 (PRO) (LEGACY)': [
    'Airbus',
    'Etihad F1',
    'Generic',
    'Lufthansa',
    'Qatar Airways',
    'South African Airways',
    'Thai Airways',
    'Virgin Atlantic',
    'Virgin Atlantic Old'
  ],
  'Airbus A350-900 (PRO)': [
    'Aer Lingus',
    'Aeroflot',
    'Afriqiyah Airways',
    'Air Caraibes',
    'Air France',
    'Air Mauritius',
    'Airbus Factory Carbon',
    'Asiana Airlines',
    'Cathay Pacific',
    'China Airlines',
    'China Eastern Airlines',
    'China Southern Airlines',
    'Delta Air Lines',
    'Emirates',
    'Ethiopian Airlines',
    'Evelop Airlines',
    'Fiji Airways',
    'Finnair',
    'FrenchBee',
    'Generic',
    'Iberia',
    'IF 10 year Anniversary',
    'IF 2019',
    'Japan Airlines',
    'KLM',
    'LATAM',
    'Lufthansa',
    'Malaysia Airlines',
    'Philippine Airlines',
    'Qatar Airways',
    'SAS',
    'Singapore Airlines',
    'TAM Airlines',
    'Thai Airways',
    'Turkish Airlines',
    'United Airlines',
    'Vietnam Airlines'
  ],
  'Airbus A380-800 (Free) (LEGACY)': [
    'Air Austral',
    'Air France',
    'Asiana Airlines',
    'British Airways',
    'Emirates',
    'Etihad',
    'Generic',
    'Korean Air',
    'Lufthansa',
    'Malaysia Airlines',
    'Qantas',
    'Qatar Airways',
    'Singapore Airlines',
    'Thai Airways',
    'Transaero'
  ],
  'Boeing 717-200 (Free) (LEGACY)': [
    'AirTran',
    'AirTran - Atlanta Falcons',
    'Bangkok Air',
    'Blue1',
    'Delta Air Lines',
    'Generic',
    'Hawaiian',
    'MexicanaClick',
    'QantasLink',
    'Quantum Air',
    'Spanair'
  ],
  'Boeing 737-700 (Free)': [
    'Aeromexico',
    'Air Berlin',
    'Air China',
    'AirTran',
    'BBJ - Black and Purple',
    'BBJ - Gold and Red',
    'BBJ - Grey and Black',
    'BBJ - IF 2014',
    'BBJ - IF 2015',
    'BBJ - IF 2018',
    'BBJ - USAF',
    'Fiji Airways',
    'Generic',
    'GOL',
    'KLM',
    'KLM 2015',
    'Luxair',
    'SAS',
    'Southwest - Canyon Blue',
    'Southwest - Desert Gold',
    'Southwest - Heart',
    'Southwest - Illinois One',
    'Southwest Shamu',
    'TAAG Angola Airlines',
    'TUIFly',
    'Turkish Airlines',
    'United Airlines',
    'WestJet'
  ],
  'Boeing 737-800 (PRO)': [
    'Aerolíneas Argentinas',
    'Aeromexico',
    'Alaska Airlines',
    'American Airlines',
    'American Airlines - Astrojet',
    'American Airlines - Old',
    'American Airlines - TWA',
    'Arik Air',
    'Avelo',
    'British Airways - Comair',
    'Caribbean Airlines',
    'Copa Airlines',
    'Delta Air Lines',
    'EgyptAir',
    'El Al',
    'Flydubai',
    'Garuda Indonesia',
    'Generic',
    'GOL 2018',
    'GOL+',
    'Jal Express',
    'Jet2',
    'Kenya Airways',
    'Kulula',
    'LOT Polish Airways',
    'Malaysia Airlines',
    'Mango',
    'Norwegian Air Shuttle',
    'Pegasus Airlines',
    'Qantas',
    'REX Airlines',
    'Royal Air Maroc',
    'Ryanair',
    'SAS',
    'South African Airways',
    'Southwest - Canyon Blue',
    'Southwest - Heart',
    'Sun Country Airlines',
    'Thomson',
    'Transavia',
    'TUI',
    'TUIFly',
    'United Airlines',
    'United Airlines 2019',
    'Virgin Australia',
    'Webjet',
    'Westjet'
  ],
  'Boeing 737-900 (PRO)': [
    'Aeroflot',
    'Alaska Airlines',
    'Alaska Airlines 2016',
    'Alaska Airlines Virgin',
    'BBJ3',
    'Delta Air Lines',
    'Factory',
    'Generic',
    'Jet Airways',
    'KLM',
    'Korean Airlines',
    'Lion Air',
    'Malindo Air',
    'Spicejet',
    'Sriwijaya Air',
    'Turkish Airlines',
    'Ukraine International',
    'United Airlines'
  ],
  'Boeing 747-200 (PRO)': [
    'Air Canada',
    'Air Portugal',
    'Alitalia',
    'EAA 50th',
    'Generic',
    'Iberia',
    'Iran Air',
    'Japan Airlines',
    'KLM',
    'Northwest Airlines',
    'Olympic',
    'Pakistan Airlines',
    'PAN AM',
    'SAS',
    'South African Airways'
  ],
  'Boeing 747-400 (Free)': [
    'Air France',
    'Air India',
    'Asiana Airlines',
    'Atlas Air',
    'British Airways',
    'Cathay Pacific',
    'China Airlines',
    'Delta Air Lines',
    'Emirates',
    'EVA Air',
    'Generic',
    'Japan Airlines',
    'KLM',
    'Korean Air',
    'Lufthansa',
    'Malaysia Airlines',
    'Qantas',
    'Singapore Airlines',
    'South African Airways',
    'Thai Airways',
    'United Airlines',
    'Virgin Atlantic'
  ],
  'Boeing 777-300ER (PRO)': [
    'Air Canada',
    'Air France',
    'American Airlines',
    'Asiana Airlines',
    'Cathay Pacific',
    'China Eastern',
    'China Southern',
    'Delta Air Lines',
    'Emirates',
    'Etihad',
    'EVA Air',
    'Generic',
    'Japan Airlines',
    'KLM',
    'Korean Air',
    'Lufthansa',
    'Malaysia Airlines',
    'Qantas',
    'Qatar Airways',
    'Singapore Airlines',
    'Thai Airways',
    'Turkish Airlines',
    'United Airlines',
    'Vietnam Airlines'
  ],
  'Boeing 787-9 (PRO)': [
    'Aeromexico',
    'Air Canada',
    'Air New Zealand',
    'All Nippon Airways',
    'American Airlines',
    'British Airways',
    'China Southern',
    'Ethiopian Airlines',
    'Etihad',
    'EVA Air',
    'Generic',
    'Japan Airlines',
    'KLM',
    'LATAM',
    'Norwegian Air Shuttle',
    'Qantas',
    'Qatar Airways',
    'Royal Air Maroc',
    'Scoot',
    'Singapore Airlines',
    'United Airlines',
    'Vietnam Airlines'
  ]
}

async function main() {
  console.log('Starting Infinite Flight fleet import...')
  
  try {
    // 既存のデータをクリア（オプション - コメントアウトして保持することも可能）
    // await prisma.livery.deleteMany({})
    // await prisma.aircraftType.deleteMany({})
    
    let totalAircraftTypes = 0
    let totalLiveries = 0
    
    for (const [aircraftTypeName, liveries] of Object.entries(fleetData)) {
      // 機種名から (PRO), (Free), (LEGACY) などのタグを削除
      const cleanAircraftTypeName = aircraftTypeName
        .replace(/\s*\(PRO\)\s*/gi, ' ')
        .replace(/\s*\(Free\)\s*/gi, ' ')
        .replace(/\s*\(LEGACY\)\s*/gi, ' ')
        .trim()
      
      // 機種を取得または作成
      let aircraftType = await prisma.aircraftType.findFirst({
        where: { name: cleanAircraftTypeName }
      })
      
      if (!aircraftType) {
        aircraftType = await prisma.aircraftType.create({
          data: {
            name: cleanAircraftTypeName
          }
        })
        console.log(`Created aircraft type: ${cleanAircraftTypeName}`)
        totalAircraftTypes++
      } else {
        console.log(`Aircraft type already exists: ${cleanAircraftTypeName}`)
      }
      
      // リバリーを追加
      for (const liveryName of liveries) {
        const existingLivery = await prisma.livery.findFirst({
          where: {
            aircraftTypeId: aircraftType.id,
            name: liveryName
          }
        })
        
        if (!existingLivery) {
          await prisma.livery.create({
            data: {
              aircraftTypeId: aircraftType.id,
              name: liveryName
            }
          })
          console.log(`  Created livery: ${liveryName}`)
          totalLiveries++
        } else {
          console.log(`  Livery already exists: ${liveryName}`)
        }
      }
    }
    
    console.log('\nImport completed!')
    console.log(`Total aircraft types: ${totalAircraftTypes} new, ${Object.keys(fleetData).length} total`)
    console.log(`Total liveries: ${totalLiveries} new`)
    
  } catch (error) {
    console.error('Error importing fleet data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

