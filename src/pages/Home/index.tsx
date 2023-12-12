import { HandPalm, Play } from 'phosphor-react'
import { useEffect, useState } from 'react'

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

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([]) // o estado vai armazenar uma lista de ciclos
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)
  // Com base no id do ciclo ativo, percorrer todos os ciclos e retornar o ciclo que tem o mesmo id do ciclo ativo

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

  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0

  const minutesAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  const minutes = String(minutesAmount).padStart(2, '0') // se a variável de minutos não tiver 2 caracteres, incluir zeros no começo da string até completar 2 caracteres
  const seconds = String(secondsAmount).padStart(2, '0')

  // Quando tiver um ciclo acontecendo, colocar o countdown também no título da aba
  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [minutes, seconds, activeCycle])

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
        <NewCycleForm />
        <Countdown
          activeCycle={activeCycle}
          setCycles={setCycles}
          activeCycleId={activeCycleId}
        />

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
