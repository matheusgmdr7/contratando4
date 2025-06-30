export interface HealthQuestion {
  id: number
  question: string
}

export const healthQuestions: HealthQuestion[] = [
  {
    id: 1,
    question: "Teve alguma doença que resultou em internação nos últimos 2 anos? (qual?)",
  },
  {
    id: 2,
    question:
      "Foi submetido(a) a internações clínicas, cirúrgicas ou psiquiátricas nos últimos 5 anos? Caso positivo, informe quando e qual doença.",
  },
  {
    id: 3,
    question: "Possui alguma doença hereditária ou congênita? (qual?)",
  },
  {
    id: 4,
    question: "É portador de alguma doença que desencadeou sequela física? (qual?)",
  },
  {
    id: 5,
    question: "É portador de alguma doença que necessitará de transplante?",
  },
  {
    id: 6,
    question: "É portador de doença renal que necessite diálise e/ou hemodiálise?",
  },
  {
    id: 7,
    question: "É portador de câncer? (informar a localização)",
  },
  {
    id: 8,
    question:
      "Tem ou teve alguma doença oftalmológica, como catarata, glaucoma, astigmatismo, miopia, hipermetropia ou outra? Fez cirurgia refrativa?",
  },
  {
    id: 9,
    question:
      "Tem ou teve alguma doença do ouvido, nariz ou garganta, como sinusite, desvio de septo, amigdalite, otite ou outra?",
  },
  {
    id: 10,
    question:
      "É portador de alguma doença do aparelho digestivo, como gastrite, úlcera, colite, doença da vesícula biliar ou outras?",
  },
  {
    id: 11,
    question: "É portador de alguma doença ortopédica como hérnia de disco, osteoporose ou outros?",
  },
  {
    id: 12,
    question:
      "É portador de alguma doença neurológica como mal de Parkinson, doenças de Alzheimer, epilepsia ou outros?",
  },
  {
    id: 13,
    question: "É portador de alguma doença cardíaca, circulatória (varizes e outras), hipertensiva ou diabetes?",
  },
  {
    id: 14,
    question: "É portador de alguma doença ginecológica / urológica?",
  },
  {
    id: 15,
    question: "É portador de hérnia inguinal, umbilical, incisional ou outras?",
  },
  {
    id: 16,
    question: "É portador de alguma doença infectocontagiosa, inclusive AIDS ou hepatite?",
  },
  {
    id: 17,
    question:
      "É portador de alguma doença psiquiátrica, como depressão, esquizofrenia, demência, alcoolismo, dependência de drogas ou outra?",
  },
  {
    id: 18,
    question: "Teve alguma patologia que necessitou de tratamento psicológico ou psicoterápico? (qual?)",
  },
  {
    id: 19,
    question:
      "É portador ou já sofreu de alguma doença do aparelho respiratório, como asma, doença pulmonar obstrutiva crônica, bronquite, enfisema ou outra?",
  },
  {
    id: 20,
    question: "Tem ou teve alguma doença não relacionada nas perguntas anteriores?",
  },
  {
    id: 21,
    question: "É gestante?",
  },
]
