using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GuardianesAgua3d.Models
{
    public class MazeGenerator
    {
        private static Random rand = new Random();

        public static int[,] Generate(int width, int height)
        {
            int[,] maze = new int[width, height];
            for (int x = 0; x < width; x++)
                for (int y = 0; y < height; y++)
                    maze[x, y] = 1;

            maze[1, 1] = 0;
            CarvePassagesFrom(1, 1, maze, width, height);

            maze[1, 1] = 0; // Entrada
            maze[width - 2, height - 2] = 0; // Salida

            return maze;
        }

        private static void CarvePassagesFrom(int cx, int cy, int[,] maze, int width, int height)
        {
            int[] directions = { 0, 1, 2, 3 };
            Shuffle(directions);

            foreach (int dir in directions)
            {
                int nx = cx, ny = cy;
                if (dir == 0) ny -= 2;
                else if (dir == 1) nx += 2;
                else if (dir == 2) ny += 2;
                else if (dir == 3) nx -= 2;

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[nx, ny] == 1)
                {
                    maze[nx, ny] = 0;
                    maze[cx + (nx - cx) / 2, cy + (ny - cy) / 2] = 0;
                    CarvePassagesFrom(nx, ny, maze, width, height);
                }
            }
        }

        private static void Shuffle(int[] array)
        {
            for (int i = array.Length - 1; i > 0; i--)
            {
                int j = rand.Next(0, i + 1);
                int temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
    }