import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { db } from "./firebaseConfig";  // Asegura que está importando correctamente
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

const gridSize = 20;
const initialSnake = [{ x: 10, y: 10 }];
const initialDirection = "RIGHT";

const SnakeGame = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState(initialDirection);
  const [food, setFood] = useState(generateFood());
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    fetchHighScore();
  }, []);

  useEffect(() => {
    if (gameRunning) {
      const interval = setInterval(moveSnake, 100);
      return () => clearInterval(interval);
    }
  }, [snake, direction, gameRunning]);

  async function fetchHighScore() {
    try {
      const scoresRef = collection(db, 'snake_scores');
      const q = query(scoresRef, orderBy('score', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
     
      if (!querySnapshot.empty) {
        const topScore = querySnapshot.docs[0].data().score;
        setHighScore(topScore);
      }
    } catch (error) {
      console.error("Error fetching high score:", error);
    }
  }

  async function saveScore() {
    try {
      const scoresRef = collection(db, 'snake_scores');
      await addDoc(scoresRef, {
        score: score,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error saving score:", error);
    }
  }

  function generateFood() {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  }

  function moveSnake() {
    const newHead = { ...snake[0] };
    if (direction === "UP") newHead.y -= 1;
    if (direction === "DOWN") newHead.y += 1;
    if (direction === "LEFT") newHead.x -= 1;
    if (direction === "RIGHT") newHead.x += 1;

    if (checkCollision(newHead)) {
      setGameRunning(false);
      saveScore();
      Alert.alert(`¡Game Over! Puntuación: ${score}`);
      setPreviousScore(score);
      return;
    }

    const newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood());
      setScore(score + 1);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }

  function checkCollision(head) {
    return (
      head.x < 0 ||
      head.x >= gridSize ||
      head.y < 0 ||
      head.y >= gridSize ||
      snake.some((segment) => segment.x === head.x && segment.y === head.y)
    );
  }

  function startGame() {
    setSnake(initialSnake);
    setDirection(initialDirection);
    setFood(generateFood());
    setScore(0);
    setGameRunning(true);
    setShowGame(true);
  }

  return (
    <View style={styles.container}>
      {!showGame ? (
        <View style={styles.menu}>
          <Text style={styles.title}>🐍 Snake Game</Text>
          <Text style={styles.score}>Mejor Puntuación: {highScore}</Text>
          <Text style={styles.score}>Puntuación Anterior: {previousScore}</Text>
          <Button title="Iniciar Juego" onPress={startGame} />
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.score}>Puntuación: {score} | Mejor Puntuación: {highScore}</Text>
          <View style={styles.grid}>
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);
              const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <View
                  key={index}
                  style={[styles.cell, isSnake ? styles.snake : isFood ? styles.food : null]}
                />
              );
            })}
          </View>
          <View style={styles.controls}>
            <TouchableOpacity onPress={() => setDirection("UP")} style={styles.button}><Text>⬆️</Text></TouchableOpacity>
            <View style={styles.horizontalControls}>
              <TouchableOpacity onPress={() => setDirection("LEFT")} style={styles.button}><Text>⬅️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setDirection("DOWN")} style={styles.button}><Text>⬇️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setDirection("RIGHT")} style={styles.button}><Text>➡️</Text></TouchableOpacity>
            </View>
          </View>
          <Button title={gameRunning ? "Reiniciar" : "Iniciar Juego"} onPress={startGame} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  menu: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  score: {
    fontSize: 18,
    marginVertical: 10,
  },
  gameContainer: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: gridSize * 15,
    height: gridSize * 15,
    backgroundColor: "black",
    marginVertical: 20,
  },
  cell: {
    width: 15,
    height: 15,
    borderWidth: 0.5,
    borderColor: "#444",
  },
  snake: {
    backgroundColor: "green",
  },
  food: {
    backgroundColor: "red",
  },
  controls: {
    alignItems: "center",
    marginVertical: 20,
  },
  horizontalControls: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
});

export default SnakeGame;
