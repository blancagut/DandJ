const results = [
  { number: "5,000+", label: "Cases Won" },
  { number: "25+", label: "Years Experience" },
  { number: "98%", label: "Success Rate" },
  { number: "15,000+", label: "Clients Served" },
]

const caseResults = [
  {
    amount: "$2.5M",
    type: "Settlement",
    description: "Civil rights violation case against local police department",
  },
  {
    amount: "Dismissed",
    type: "Criminal Case",
    description: "Felony charges dropped due to insufficient evidence",
  },
  {
    amount: "Approved",
    type: "Green Card",
    description: "Complex asylum case for family of five from Venezuela",
  },
  {
    amount: "$1.2M",
    type: "Verdict",
    description: "Employment discrimination case in federal court",
  },
]

export function ResultsSection() {
  return (
    <section id="results" className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
          {results.map((result) => (
            <div key={result.label} className="text-center">
              <p className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-accent">{result.number}</p>
              <p className="text-primary-foreground/70 mt-2 text-sm md:text-base">{result.label}</p>
            </div>
          ))}
        </div>

        {/* Case Results */}
        <div className="text-center mb-12">
          <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">Proven Results</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Recent Case Victories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {caseResults.map((caseResult, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20"
            >
              <p className="font-serif text-3xl font-bold text-accent">{caseResult.amount}</p>
              <p className="text-primary-foreground font-medium mt-2">{caseResult.type}</p>
              <p className="text-primary-foreground/70 text-sm mt-2 leading-relaxed">{caseResult.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
