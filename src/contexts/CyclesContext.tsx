import { ReactNode, createContext, useState } from 'react'

interface CreateCycleData {
  task: string
  minutesAmount: number
}
/*
  Não reaproveitou o type NewCycleFormData da Home porque eles pertencem a camadas diferentes
  Se em algum momento desejar chamar a função createNewCycle sem ser pelo formulário,
  ou se remover a biblioteca react-hook-form e o zod da aplicação, isso não deve interferir no contexto,
  que deve ser desacoplado de bibliotecas externas, para que caso mude as bibliotecas externas, isso não afete o contexto
*/

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date // salvar a data que o timer ficou ativo para, com base nela, saber quanto tempo passou
  interruptedDate?: Date
  // Anotar dentro do ciclo se ele foi interrompido ou não, como uma forma de ter um histórico de quais ciclos foram interrompidos e quais não foram, para conseguir mostrar no status do histórico
  finishedDate?: Date
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined // quando não houver nenhum ciclo ativo, a variável fica como undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
  createNewCycle: (data: CreateCycleData) => void
  interruptCurrentCycle: () => void
}

export const CyclesContext = createContext({} as CyclesContextType)

interface CyclesContextProviderProps {
  children: ReactNode // ReactNode é qualquer HTML/JSX válido
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cycles, setCycles] = useState<Cycle[]>([]) // o estado vai armazenar uma lista de ciclos
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)
  // Com base no id do ciclo ativo, percorrer todos os ciclos e retornar o ciclo que tem o mesmo id do ciclo ativo

  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function markCurrentCycleAsFinished() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return {
            ...cycle,
            finishedDate: new Date(),
          }
        } else {
          return cycle
        }
      }),
    )
  }

  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime()) // pega a data atual convertida para milissegundos

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(), // data que o ciclo iniciou
    }

    setCycles((state) => [...state, newCycle]) // copia o estado atual da variável de ciclos e adiciona o novo ciclo
    // Closures: toda vez que o estado que está sendo alterado depende da sua versão anterior, é recomendado setar o valor desse estado no formato de função
    setActiveCycleId(id)
    setAmountSecondsPassed(0) // evitar que ao criar um novo ciclo, seja reaproveitado os segundos que se passaram no ciclo anterior

    // reset() // retorna os campos do formulário para os valores definidos no defaultValues
  }

  function interruptCurrentCycle() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return {
            ...cycle,
            interruptedDate: new Date(),
          }
        } else {
          return cycle
        }
        // Percorrer todos os ciclos e, para cada ciclo, se o ciclo for o ciclo ativo, retornar todos os dados do ciclo, adicionando uma nova informação da data em que o ciclo foi interrompido
        // Se não, retornar o ciclo sem alterações
        // Para seguir os princípios da imutabilidade, ao trabalhar com arrays, no caso arrays de objetos, para mudar uma informação de um desses objetos, obrigatoriamente precisa percorrer todos os itens do array procurando pelo objeto que quer alterar para então fazer a alteração
        // O map vai percorrer cada um dos ciclos e retornar de dentro do map cada um dos ciclos, alterados ou não
      }),
    )

    setActiveCycleId(null)
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        markCurrentCycleAsFinished,
        amountSecondsPassed,
        setSecondsPassed,
        createNewCycle,
        interruptCurrentCycle,
      }}
    >
      {/*
        Para enviar a função setCycles inteira para dentro do conexto, é necessário adicionar sua tipagem do TS, que é complexa
        Ao invés de enviar a função setCycles inteira, criar a função markCurrentCycleAsFinished e enviá-la pelo contexto
        Como a função register não pertence ao contexto dos ciclos, sendo enviada pelo contexto próprio do react-hook-form
      */}
      {children}
      {/* a propriedade children serve para informar onde o conteúdo passado como filho do componente será acoplado */}
    </CyclesContext.Provider>
  )
}
