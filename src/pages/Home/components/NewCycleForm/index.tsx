import { FormContainer, MinutesAmountInput, TaskInput } from "./styles";

export function NewCycleForm {
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