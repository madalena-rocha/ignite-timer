import { HandPalm, Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
// Os hooks são funções que acoplam uma funcionalidade em um componente existente
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod' // o zod não tem um export default, por isso importa tudo como zod
import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns' // differenceInSeconds calcula a diferença entre duas datas em segundos

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  StopCountdownButton,
  TaskInput,
} from './styles'

// Existem dois modelos de trabalhar com formulários em React, controlled e uncontrolled components
// Controlled é quando mantém em tempo real a informação inserida no input do usuário guardada dentro do estado no componente da aplicação
// Benefícios: como tem o valor em tempo real, é possível facilmente ter acesso a esses valores no submit e refletir visualmente alterações na interface baseado no valor desses inputs
// Desvantagens: no React, cada atualização de estado provoca uma nova renderização, recalculando todo o conteúdo do componente do estado que mudou, podendo se tornar um problema para a aplicação em questão de performance
// Uncontrolled é quando busca a informação do valor do input somente quando precisa dela
// Como não tem acesso ao valor digitado letra a letra, perde a fluidez de habilitar ou desabilitar coisas, mas ganha em performance
// Formulários simples com poucos campos geralmente usam controlled, já dashboards com grande quantidade de inputs precisam usar o modelo de uncontrolled

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
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
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

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)
  // Com base no id do ciclo ativo, percorrer todos os ciclos e retornar o ciclo que tem o mesmo id do ciclo ativo

  // No setInterval e o setTimeout, ao definir o intervalo de 1s, este 1s geralmente não é preciso, e sim uma estimaiva,
  // principalmente se tiver rodando o navegador numa aba em background, ou se o computador está com um processamento muito lento, essa estimativa de 1s pode não acontecer em exatamente 1s
  // Se for se basear somente no 1s do intervalo do setInterval para reduzir o contador e aumentar o tanto de segundos que passaram, pode ser que o timer não fique correto, passando menos segundos do que realmente já passou

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0 // converer o número de minutos inserido pelo usuário em segundos

  useEffect(() => {
    let interval: number

    // Se tiver um ciclo ativo, fazer a redução do countdown
    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate,
        )

        // Se a diferença em segundos da data que o ciclo foi criado para a data atual for igual ou maior que o total de segundos que o ciclo deveria ter, o ciclo acabou
        if (secondsDifference >= totalSeconds) {
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

          setAmountSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          // setAmountSecondsPassed(state => state + 1)
          // Como o 1s não é preciso, comparar a data atual com a data salva no startDate e ver quantos segundos já se passaram
          setAmountSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    // Havia um intervalo rodando com o ciclo criado anteriormente, ou seja, o useEffect executou uma vez assim que foi criado o primeiro ciclo
    // Ao criar um novo ciclo, o useEffect executa novamente, pois a variável activeCycle mudou
    // A função de retorno do useEffect serve para, quando executar o useEffect de novo, porque aconteceu alguma mudança nas dependências, resetar o que estava fazendo no useEffect anterior, para que não aconteça mais
    // Como foi criado um intervalo dentro do useEffect, cada vez que ele executa, está sendo criado um novo intervalo, sem deletar os intervalos criados anteriormente
    // A função de retorno será utilizada para deletar os intervalos que não são mais necessários
    return () => {
      clearInterval(interval)
    }
  }, [activeCycle, totalSeconds, activeCycleId])
  // Dentro do useEfecct está utilizando a variável activeCycle externa ao useEfecct
  // Sempre que usa uma variável externa, obrigatoriamente precisa incluir essa variável como dependência do useEffect

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

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput
            id="task"
            list="task-suggestions"
            placeholder="Dê um nome para o seu projeto"
            disabled={!!activeCycle} // !! porque o valor precisa ser um booleano
            {...register('task')}
            // Spread operator para transformar cada um dos métodos do retorno da função register em uma propriedade para esse input
          />

          <datalist id="task-suggestions">
            {/* Lista de sugestões para um input */}
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
            <option value="Banana" />
          </datalist>

          <label htmlFor="minutesAmount">durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={1}
            max={60}
            disabled={!!activeCycle}
            {...register('minutesAmount', { valueAsNumber: true })} // o segundo parâmetro é um objeto de configurações
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

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
