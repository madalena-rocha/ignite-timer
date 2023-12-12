import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, useForm } from 'react-hook-form'
// Os hooks são funções que acoplam uma funcionalidade em um componente existente
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod' // o zod não tem um export default, por isso importa tudo como zod
import { createContext, useState } from 'react'

import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton,
} from './styles'
import { NewCycleForm } from './components/NewCycleForm'
import { Countdown } from './components/Countdown'

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
  activeCycle: Cycle | undefined // quando não houver nenhum ciclo ativo, a variável fica como undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa.'), // string de no mínimo 1 caractere, que caso não seja informado, retornar a mensagem de validação
  minutesAmount: zod
    .number()
    .min(1, 'O ciclo precisa ser de no mínimo 5 minutos.')
    .max(60, 'O ciclo precisa ser de no máximo 60 minutos.'),
})
// Schema nada mais é do que definir um formato e validar os dados do formulário com base nesse formato

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>
// Extrai a tipagem do formulário a partir do schema de validação

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([]) // o estado vai armazenar uma lista de ciclos
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    // Dentro do zodResolver, é necessário passar o schema de validação, ou seja, de que forma os dados dos inputs deverão ser validados
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })
  // O useForm() é como se tivesse criando um novo formulário
  // A função register é o método que vai adicionar os campos de input ao formulário
  // Ela recebe o nome do input e retorna os métodos utilizados para trabalhar com inputs no JS, que a biblioteca react-hook-form utiliza para conseguir monitorar os valores dos inputs
  // function register(name: string) {
  //   return {
  //     onChange: () => void,
  //     onBlur: () => void,
  //     onFocus: () => void,
  //   }
  // }

  const { handleSubmit, watch, reset } = newCycleForm

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

  function handleCreateNewCycle(data: NewCycleFormData) {
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

    reset() // retorna os campos do formulário para os valores definidos no defaultValues
  }

  function handleInterruptCycle() {
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

  const task = watch('task') // saber o valor do campo de task em tempo real
  const isSubmitDisabled = !task

  /**
   * Prop Drilling -> Quando há MUITAS propriedades APENAS para comunicação entre componentes
   * Context API -> Permite compartilhar informações entre VÁRIOS componentes ao mesmo tempo
   * A Context API não precisa utilizar de propriedades, é como se fossem informações globais
   * que todos os componentes podem ter acesso, modificar essas informações, e quando modificadas,
   * independente de quem modificou, todos os componentes que dependem dessa informação são atualizados
   */

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <CyclesContext.Provider
          value={{
            activeCycle,
            activeCycleId,
            markCurrentCycleAsFinished,
            amountSecondsPassed,
            setSecondsPassed,
          }}
        >
          {/*
            Para enviar a função setCycles inteira para dentro do conexto, é necessário adicionar sua tipagem do TS, que é complexa
            Ao invés de enviar a função setCycles inteira, criar a função markCurrentCycleAsFinished e enviá-la pelo contexto
            Como a função register não pertence ao contexto dos ciclos, sendo enviada pelo contexto próprio do react-hook-form
          */}
          <FormProvider {...newCycleForm}>
            {/* O spread operator repassa cada uma das propriedades dentro do newCycleForm como uma propriedade para o elemento FormProvider */}
            <NewCycleForm />
          </FormProvider>
          <Countdown />
        </CyclesContext.Provider>

        {activeCycle ? (
          <StopCountdownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountdownButton>
        ) : (
          <StartCountdownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  )
}
