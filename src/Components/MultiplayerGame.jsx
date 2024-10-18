class MultiplayerGame {
    constructor() {
      this.board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      this.currentPlayer = "X";
      this.gameOver = false;
    }
  
    makeMove(row, col) {
      if (this.gameOver || this.board[row][col] !== "") return;
      this.board[row][col] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
      this.checkWinner();
    }
  
    checkWinner() {
      // Check rows and columns
      for (let i = 0; i < 3; i++) {
        if (
          this.board[i][0] === this.board[i][1] &&
          this.board[i][1] === this.board[i][2] &&
          this.board[i][0] !== ""
        ) {
          this.gameOver = true;
          return;
        }
        if (
          this.board[0][i] === this.board[1][i] &&
          this.board[1][i] === this.board[2][i] &&
          this.board[0][i] !== ""
        ) {
          this.gameOver = true;
          return;
        }
      }
      // Check diagonals
      if (
        (this.board[0][0] === this.board[1][1] &&
          this.board[1][1] === this.board[2][2] &&
          this.board[0][0] !== "") ||
        (this.board[0][2] === this.board[1][1] &&
          this.board[1][1] === this.board[2][0] &&
          this.board[0][2] !== "")
      ) {
        this.gameOver = true;
        return;
      }
    }
  
    resetGame() {
      this.board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      this.currentPlayer = "X";
      this.gameOver = false;
    }
  }
  
  export default MultiplayerGame;