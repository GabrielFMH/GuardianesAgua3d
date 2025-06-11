using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GuardianesAgua3d.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public int Level { get; set; } = 1;
        public int Score { get; set; } = 0;
        public float PositionX { get; set; }
        public float PositionZ { get; set; }
    }
}