import { useContext, useEffect } from 'react'
import { differenceInSeconds } from 'date-fns' // differenceInSeconds calcula a diferença entre duas datas em segundos
import { CyclesContext } from '../../../../contexts/CyclesContext'
import { CountdownContainer, Separator } from './styles'

export function Countdown() {
  const {
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    amountSecondsPassed,
    setSecondsPassed,
  } = useContext(CyclesContext)

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
          markCurrentCycleAsFinished()
          setSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          // setAmountSecondsPassed(state => state + 1)
          // Como o 1s não é preciso, comparar a data atual com a data salva no startDate e ver quantos segundos já se passaram
          setSecondsPassed(secondsDifference)
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
  }, [
    activeCycle,
    totalSeconds,
    activeCycleId,
    setSecondsPassed,
    markCurrentCycleAsFinished,
  ])
  // Dentro do useEfecct está utilizando a variável activeCycle externa ao useEfecct
  // Sempre que usa uma variável externa, obrigatoriamente precisa incluir essa variável como dependência do useEffect

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

  return (
    <CountdownContainer>
      <span>{minutes[0]}</span>
      <span>{minutes[1]}</span>
      <Separator>:</Separator>
      <span>{seconds[0]}</span>
      <span>{seconds[1]}</span>
    </CountdownContainer>
  )
}
