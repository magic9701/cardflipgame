//設定遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}
//撲克牌花色
const Symbols = [
  '黑桃.png', // 黑桃
  '紅心.png', // 愛心
  '方塊.png', // 方塊
  '梅花.png' // 梅花
]

const view = {
  // 撲克牌數字及花色 對應的index ->黑桃0-12、愛心13-25、方塊26-38、梅花39-51
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  //將數字轉換為英文字母
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards (...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
  cards.map(card => {
    card.classList.add('wrong')
    card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
      <div class="start-again">
        <button id="start-again">Try again</button>
      </div>
    `
    const header = document.querySelector('#header')
    header.before(div)
    const startAgain = document.querySelector('#start-again')
    //結束畫面的restart按鈕監聽
    startAgain.addEventListener('click', event => {
    controller.resetGame()
})

  },
  removeGameFinished () {
    const completedMessage = document.querySelector('.completed')
    completedMessage.remove()
  }
}
const model = {
  revealedCards: [],
  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:      
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  // 重新開始遊戲
  resetGame() {
    controller.currentState = GAME_STATE.FirstCardAwaits
    controller.generateCards()
    controller.addCardListener()
    model.score = 0
    model.triedTimes = 0
    view.renderScore(model.score)
    view.renderTriedTimes(model.triedTimes)
    view.removeGameFinished ()
  },
  // 將所有卡片綁上監聽器
  addCardListener() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
      })
    })
  },
}

const utility = {
  //洗牌
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
controller.addCardListener()
