using Microsoft.AspNetCore.Mvc;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace ArticleRecommender.Controllers;

[ApiController]
[Route("[controller]")]
public class ArController : ControllerBase
{
    private readonly string _usersFilePath;
    private readonly string _itemsFilePath;
    
    public ArController()
    {
        // Use hardcoded paths for simplicity
        _usersFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "users.csv");
        _itemsFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "items.csv");
    }
    
    [HttpGet("userIds")]
    public IActionResult GetUserIds()
    {
        try
        {
            if (!System.IO.File.Exists(_usersFilePath))
            {
                Console.WriteLine($"Users CSV file not found at path: {_usersFilePath}");
                return NotFound("Users CSV file not found");
            }

            var users = ReadCsvFile<User>(_usersFilePath);
            var userIds = users.Select(u => u.UserId).Distinct().ToList();
            return Ok(userIds);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error retrieving user IDs: {ex.Message}");
            return StatusCode(500, "Error retrieving user IDs");
        }
    }
    
    [HttpGet("itemIds")]
    public IActionResult GetItemIds()
    {
        try
        {
            if (!System.IO.File.Exists(_itemsFilePath))
            {
                Console.WriteLine($"Items CSV file not found at path: {_itemsFilePath}");
                return NotFound("Items CSV file not found");
            }

            var items = ReadCsvFile<Item>(_itemsFilePath);
            var itemIds = items.Select(i => i.ItemId).Distinct().ToList();
            return Ok(itemIds);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error retrieving item IDs: {ex.Message}");
            return StatusCode(500, "Error retrieving item IDs");
        }
    }
    
    [HttpGet("recommendations")]
    public IActionResult GetRecommendations([FromQuery] string userId = null, [FromQuery] string itemId = null, [FromQuery] string model = "hybrid")
    {
        try
        {
            if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(itemId))
            {
                return BadRequest("Either userId or itemId must be provided");
            }
            
            // Simplified - generate dummy recommendations based on model type
            int offset = model switch
            {
                "content-based" => 1,
                "collaborative" => 10,
                "hybrid" or _ => 20
            };
            
            var recommendations = Enumerable.Range(1, 5)
                .Select(i => new Recommendation
                {
                    ItemId = $"item_{offset + i}",
                    Score = 0.9 - (i * 0.05),
                    Title = $"{model.ToUpperInvariant()} Recommendation {i}"
                })
                .ToList();
            
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting {model} recommendations: {ex.Message}");
            return StatusCode(500, $"Error retrieving {model} recommendations");
        }
    }
    
    private List<T> ReadCsvFile<T>(string filePath, int limit = -1)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null
        };
        
        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, config);
        
        // Read all records or up to the limit
        var records = csv.GetRecords<T>();
        return limit > 0 
            ? records.Take(limit).ToList() 
            : records.ToList();
    }
}

// Simplified model classes
public class User
{
    public string UserId { get; set; }
}

public class Item
{
    public string ItemId { get; set; }
    public string Title { get; set; }
}

public class Recommendation
{
    public string ItemId { get; set; }
    public double Score { get; set; }
    public string Title { get; set; }
}