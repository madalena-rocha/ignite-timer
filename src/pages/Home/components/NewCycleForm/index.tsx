import { FormContainer, MinutesAmountInput, TaskInput } from './styles'
import { useContext } from 'react'
import { CyclesContext } from '../..'
import { useFormContext } from 'react-hook-form'

// Existem dois modelos de trabalhar com formulários em React, controlled e uncontrolled components
// Controlled é quando mantém em tempo real a informação inserida no input do usuário guardada dentro do estado no componente da aplicação
// Benefícios: como tem o valor em tempo real, é possível facilmente ter acesso a esses valores no submit e refletir visualmente alterações na interface baseado no valor desses inputs
// Desvantagens: no React, cada atualização de estado provoca uma nova renderização, recalculando todo o conteúdo do componente do estado que mudou, podendo se tornar um problema para a aplicação em questão de performance
// Uncontrolled é quando busca a informação do valor do input somente quando precisa dela
// Como não tem acesso ao valor digitado letra a letra, perde a fluidez de habilitar ou desabilitar coisas, mas ganha em performance
// Formulários simples com poucos campos geralmente usam controlled, já dashboards com grande quantidade de inputs precisam usar o modelo de uncontrolled

export function NewCycleForm() {
  const { activeCycle } = useContext(CyclesContext)
  const { register } = useFormContext()

  return (
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
  )
}
