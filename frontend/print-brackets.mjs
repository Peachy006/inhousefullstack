const testUsers = [
  { rank: 'Iron',        weight: 135.5, age: 18, isBoy: true  },
  { rank: 'Iron',        weight: 142.0, age: 22, isBoy: false },
  { rank: 'Bronze',      weight: 158.3, age: 25, isBoy: true  },
  { rank: 'Bronze',      weight: 120.7, age: 19, isBoy: false },
  { rank: 'Bronze',      weight: 175.1, age: 30, isBoy: true  },
  { rank: 'Silver',      weight: 160.0, age: 21, isBoy: false },
  { rank: 'Silver',      weight: 148.9, age: 27, isBoy: true  },
  { rank: 'Silver',      weight: 133.4, age: 20, isBoy: false },
  { rank: 'Gold',        weight: 185.2, age: 24, isBoy: true  },
  { rank: 'Gold',        weight: 140.6, age: 23, isBoy: false },
  { rank: 'Gold',        weight: 170.0, age: 28, isBoy: true  },
  { rank: 'Platinum',    weight: 155.8, age: 26, isBoy: false },
  { rank: 'Platinum',    weight: 190.3, age: 31, isBoy: true  },
  { rank: 'Platinum',    weight: 125.0, age: 17, isBoy: false },
  { rank: 'Diamond',     weight: 168.7, age: 29, isBoy: true  },
  { rank: 'Diamond',     weight: 145.2, age: 22, isBoy: false },
  { rank: 'Diamond',     weight: 178.4, age: 33, isBoy: true  },
  { rank: 'Master',      weight: 162.1, age: 35, isBoy: false },
  { rank: 'Master',      weight: 195.0, age: 28, isBoy: true  },
  { rank: 'Master',      weight: 138.5, age: 24, isBoy: false },
  { rank: 'Grandmaster', weight: 180.9, age: 32, isBoy: true  },
  { rank: 'Challenger',  weight: 172.3, age: 26, isBoy: false },
]

const res = await fetch('http://localhost:8080/api/brackets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUsers),
})

const text = await res.text()

if (!res.ok) {
  console.error(`Error ${res.status}:`, text)
  process.exit(1)
}

const brackets = JSON.parse(text)

brackets.forEach((bracket, i) => {
  console.log(`\n--- Bracket ${i + 1} (${bracket.users.length} users) ---`)
  bracket.users.forEach(u => {
    console.log(`  ${u.rank.padEnd(12)} age=${u.age}  weight=${u.weight}  ${u.isBoy ? 'M' : 'F'}`)
  })
})
