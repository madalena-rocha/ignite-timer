import { FormContainer, MinutesAmountInput, TaskInput } from "./styles";
import { useForm } from 'react-hook-form'
// Os hooks são funções que acoplam uma funcionalidade em um componente existente
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod' // o zod não tem um export default, por isso importa tudo como zod

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

export function NewCycleForm {
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