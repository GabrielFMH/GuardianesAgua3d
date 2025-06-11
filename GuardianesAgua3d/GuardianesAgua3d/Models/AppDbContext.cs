
using System.Collections.Generic;
using System.Numerics;
using System.Web.Mvc;
using GuardianesAgua3d.Models;
using System.Data.Entity;

namespace GuardianesAgua3d.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext() : base("DefaultConnection") { }

        public DbSet<Player> Players { get; set; }
    }
}