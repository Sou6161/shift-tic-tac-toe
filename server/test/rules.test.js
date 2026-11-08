import { test } from "node:test";
import assert from "node:assert/strict";
import { applyMove, emptyBoard, findWinner } from "../src/game/rules.js";

test("placement: puts a piece on an empty square", () => {
  const { board } = applyMove(emptyBoard(), "X", 0, [4]);
  assert.equal(board[4], "X");
});

test("placement: rejects a taken square and shift-style moves", () => {
  const b = emptyBoard();
  b[4] = "O";
  assert.ok(applyMove(b, "X", 1, [4]).error);
  assert.ok(applyMove(b, "X", 1, [0, 1]).error);
  assert.ok(applyMove(b, "X", 1, [9]).error);
  assert.ok(applyMove(b, "X", 1, "4").error);
});

test("shifting: moves own piece to an empty square only", () => {
  const b = ["X", "O", "X", "O", "X", "O", null, null, null];
  const ok = applyMove(b, "X", 6, [0, 6]);
  assert.deepEqual(ok.board.slice(0, 1), [null]);
  assert.equal(ok.board[6], "X");
  assert.ok(applyMove(b, "X", 6, [1, 6]).error, "can't move opponent's piece");
  assert.ok(applyMove(b, "X", 6, [0, 2]).error, "can't land on a piece");
  assert.ok(applyMove(b, "X", 6, [6]).error, "placement move not allowed while shifting");
});

test("findWinner spots rows, columns and diagonals", () => {
  assert.equal(findWinner(["X", "X", "X", null, null, null, null, null, null]), "X");
  assert.equal(findWinner([null, "O", null, null, "O", null, null, "O", null]), "O");
  assert.equal(findWinner(["X", null, null, null, "X", null, null, null, "X"]), "X");
  assert.equal(findWinner(emptyBoard()), null);
});
