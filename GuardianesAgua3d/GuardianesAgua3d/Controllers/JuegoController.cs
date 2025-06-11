using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using GuardianesAgua3d.Models;

namespace GuardianesAgua3d.Controllers
{
    public class JuegoController : Controller
    {
        // GET: Juego
        private readonly AppDbContext _context = new AppDbContext();

        public ActionResult Index(string token)
        {
            var player = _context.Players.FirstOrDefault(p => p.UserId == "1") ?? new Player { Name = "Explorador", UserId = "1" };
            ViewBag.Token = token;
            return View(player);
        }
    }
}