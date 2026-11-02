(() => {
  const questions = window.EXAM_QUESTIONS;
  const answers = Array(questions.length).fill(null);
  let currentQuestion = 0;

  const map = document.querySelector("#question-map");
  const questionCard = document.querySelector("#question-card");
  const resultsCard = document.querySelector("#results-card");
  const topic = document.querySelector("#question-topic");
  const number = document.querySelector("#question-number");
  const prompt = document.querySelector("#question-prompt");
  const answerList = document.querySelector("#answer-list");
  const feedback = document.querySelector("#feedback");

  function getScore() {
    const answered = answers.filter((answer) => answer !== null).length;
    const correct = answers.reduce(
      (total, answer, index) => total + (answer === questions[index].answer ? 1 : 0),
      0,
    );
    return { answered, correct };
  }

  function renderStats() {
    const { answered, correct } = getScore();
    const accuracy = answered ? Math.round((correct / answered) * 100) : null;

    document.querySelector("#answered-stat").innerHTML =
      `${answered} <small>/ ${questions.length}</small>`;
    document.querySelector("#correct-stat").textContent = correct;
    document.querySelector("#accuracy-stat").innerHTML =
      accuracy === null ? "—<small>%</small>" : `${accuracy}<small>%</small>`;
    document.querySelector("#map-count").textContent =
      `${answered} OF ${questions.length} ANSWERED`;
    document.querySelector("#progress-fill").style.width =
      `${(answered / questions.length) * 100}%`;
  }

  function renderMap() {
    map.replaceChildren();

    questions.forEach((question, index) => {
      const button = document.createElement("button");
      const selectedAnswer = answers[index];
      button.type = "button";
      button.className = "map-question";
      button.textContent = question.id;
      button.setAttribute("aria-label", `Question ${question.id}${selectedAnswer === null ? ", unanswered" : selectedAnswer === question.answer ? ", correct" : ", incorrect"}`);

      if (index === currentQuestion) button.classList.add("is-current");
      if (selectedAnswer !== null) {
        button.classList.add("is-answered");
        button.classList.add(selectedAnswer === question.answer ? "is-correct" : "is-wrong");
      }

      button.addEventListener("click", () => showQuestion(index));
      map.append(button);
    });
  }

  function renderFeedback(selectedAnswer) {
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.answer;
    feedback.hidden = false;
    feedback.className = `feedback ${isCorrect ? "feedback-correct" : "feedback-incorrect"}`;
    feedback.replaceChildren();

    const icon = document.createElement("span");
    icon.className = "feedback-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isCorrect ? "✓" : "!";

    const copy = document.createElement("span");
    copy.className = "feedback-copy";
    const heading = document.createElement("strong");
    heading.textContent = isCorrect ? "That's correct." : "Not quite.";
    const detail = document.createElement("span");
    detail.textContent = isCorrect
      ? "Nice work — you’ve got this one."
      : `Correct answer: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}`;
    copy.append(heading, detail);
    feedback.append(icon, copy);
  }

  function renderQuestion() {
    const question = questions[currentQuestion];
    const selectedAnswer = answers[currentQuestion];
    topic.textContent = question.topic.toUpperCase();
    number.innerHTML =
      `QUESTION ${String(question.id).padStart(2, "0")} <i>/ ${questions.length}</i>`;
    prompt.textContent = question.prompt;
    answerList.replaceChildren();
    feedback.hidden = true;
    feedback.className = "feedback";

    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.setAttribute("aria-pressed", selectedAnswer === index ? "true" : "false");

      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + index);
      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = option;
      const marker = document.createElement("span");
      marker.className = "option-marker";
      marker.setAttribute("aria-hidden", "true");
      button.append(letter, text, marker);

      if (selectedAnswer === index) button.classList.add("is-selected");
      if (selectedAnswer !== null && index === question.answer) button.classList.add("is-correct");
      if (selectedAnswer === index && selectedAnswer !== question.answer) button.classList.add("is-wrong");

      button.addEventListener("click", () => {
        answers[currentQuestion] = index;
        renderQuestion();
        renderStats();
        renderMap();
      });
      answerList.append(button);
    });

    if (selectedAnswer !== null) renderFeedback(selectedAnswer);
    document.querySelector("#previous-question").disabled = currentQuestion === 0;
    document.querySelector("#next-question").innerHTML =
      currentQuestion === questions.length - 1
        ? 'Last question <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>'
        : 'Next question <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>';
  }

  function showQuestion(index) {
    currentQuestion = index;
    questionCard.hidden = false;
    resultsCard.hidden = true;
    renderQuestion();
    renderMap();
    document.querySelector(".question-stage").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showResults() {
    const { answered, correct } = getScore();
    const missed = questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => answers[index] !== question.answer);
    const unanswered = answers.filter((answer) => answer === null).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

    questionCard.hidden = true;
    resultsCard.hidden = false;
    resultsCard.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "results-heading";
    const eyebrow = document.createElement("div");
    eyebrow.className = "eyebrow";
    eyebrow.innerHTML = '<span class="eyebrow-line"></span> EXAM COMPLETE';
    const title = document.createElement("h2");
    title.textContent = "Your results are in.";
    const subtitle = document.createElement("p");
    subtitle.textContent = "Every missed question is a chance to strengthen your network.";
    heading.append(eyebrow, title, subtitle);
    resultsCard.append(heading);

    const scorePanel = document.createElement("div");
    scorePanel.className = "results-score-panel";
    const scoreMain = document.createElement("div");
    scoreMain.className = "results-score-main";
    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = "FINAL SCORE";
    const score = document.createElement("strong");
    score.innerHTML = `${correct}<span> / ${questions.length}</span>`;
    scoreMain.append(scoreLabel, score);

    const accuracyPanel = document.createElement("div");
    accuracyPanel.className = "results-detail";
    accuracyPanel.innerHTML = `<span>ACCURACY</span><strong>${accuracy}%</strong>`;
    const answeredPanel = document.createElement("div");
    answeredPanel.className = "results-detail";
    answeredPanel.innerHTML = `<span>ANSWERED</span><strong>${answered} / ${questions.length}</strong>`;
    scorePanel.append(scoreMain, accuracyPanel, answeredPanel);
    resultsCard.append(scorePanel);

    const reviewHeading = document.createElement("div");
    reviewHeading.className = "review-heading";
    const reviewTitle = document.createElement("h3");
    reviewTitle.textContent = unanswered ? "Review your questions" : "Questions to review";
    const reviewCount = document.createElement("span");
    reviewCount.textContent = `${missed.length} TO REVIEW`;
    reviewHeading.append(reviewTitle, reviewCount);
    resultsCard.append(reviewHeading);

    if (missed.length) {
      const reviewList = document.createElement("div");
      reviewList.className = "review-list";
      missed.forEach(({ question, index }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "review-item";
        const status = document.createElement("span");
        status.className = answers[index] === null ? "review-status review-open" : "review-status";
        status.textContent = answers[index] === null ? "—" : "!";
        const copy = document.createElement("span");
        copy.className = "review-copy";
        const label = document.createElement("strong");
        label.textContent = `Q${String(question.id).padStart(2, "0")} · ${question.topic}`;
        const questionText = document.createElement("span");
        questionText.textContent = question.prompt;
        copy.append(label, questionText);
        const correct = document.createElement("span");
        correct.className = "review-answer";
        correct.textContent =
          `Correct: ${String.fromCharCode(65 + question.answer)} — ${question.options[question.answer]}`;
        button.append(status, copy, correct);
        button.addEventListener("click", () => showQuestion(index));
        reviewList.append(button);
      });
      resultsCard.append(reviewList);
    } else {
      const perfect = document.createElement("p");
      perfect.className = "all-correct";
      perfect.textContent = "Perfect run. You answered every question correctly.";
      resultsCard.append(perfect);
    }

    const resultActions = document.createElement("div");
    resultActions.className = "results-actions";
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "nav-button";
    backButton.textContent = "Back to exam";
    backButton.addEventListener("click", () => showQuestion(currentQuestion));
    resultActions.append(backButton);
    resultsCard.append(resultActions);
    renderStats();
    renderMap();
    document.querySelector(".question-stage").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelector("#previous-question").addEventListener("click", () => {
    if (currentQuestion > 0) showQuestion(currentQuestion - 1);
  });
  document.querySelector("#next-question").addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) showQuestion(currentQuestion + 1);
  });
  document.querySelector("#finish-exam").addEventListener("click", () => {
    const unanswered = questions.length - getScore().answered;
    if (
      unanswered > 0 &&
      !window.confirm(`${unanswered} question${unanswered === 1 ? "" : "s"} unanswered. Finish the exam anyway?`)
    ) {
      return;
    }
    showResults();
  });
  document.querySelector("#reset-exam").addEventListener("click", () => {
    if (getScore().answered && !window.confirm("Reset your answers and start over?")) return;
    answers.fill(null);
    currentQuestion = 0;
    showQuestion(0);
    renderStats();
  });
  document.addEventListener("keydown", (event) => {
    if (
      resultsCard.hidden === false ||
      event.target.matches("input, textarea, select, [contenteditable='true']")
    ) {
      return;
    }

    if (event.key === "ArrowLeft" && currentQuestion > 0) {
      event.preventDefault();
      showQuestion(currentQuestion - 1);
    }
    if (event.key === "ArrowRight" && currentQuestion < questions.length - 1) {
      event.preventDefault();
      showQuestion(currentQuestion + 1);
    }
  });

  renderStats();
  renderMap();
  renderQuestion();
})();