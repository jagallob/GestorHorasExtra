using Microsoft.EntityFrameworkCore;
using ExtraHours.API.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ExtraHours.API.Utils;
using ExtraHours.API.Repositories.Implementations;
using ExtraHours.API.Repositories.Interfaces;
using ExtraHours.API.Service.Implementations;
using ExtraHours.API.Service.Interface;
using ExtraHours.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar repositorios y servicios
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IExtraHourRepository, ExtraHourRepository>();
builder.Services.AddScoped<IManagerRepository, ManagerRepository>();
builder.Services.AddScoped<IExtraHoursConfigRepository, ExtraHoursConfigRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IExtraHourService, ExtraHourService>();
builder.Services.AddSingleton<IJWTUtils, JWTUtils>();
builder.Services.AddScoped<IExtraHoursConfigService, ExtraHoursConfigService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IExtraHourCalculationService, ExtraHourCalculationService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Configurar controladores
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

// Configurar CORS
var frontendUrl = builder.Configuration["FrontendUrl"]
    ?? "https://lemon-coast-08a45280f.6.azurestaticapps.net";

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionCors", policy =>
    {
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configurar Kestrel para escuchar en el puerto 8080 (requerido por Azure)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(8080);
});

// Configurar autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["access_token"] ??
                               context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ManagerOnly", policy => policy.RequireRole("manager"));
    options.AddPolicy("EmpleadoOnly", policy => policy.RequireRole("empleado"));
    options.AddPolicy("SuperusuarioOnly", policy => policy.RequireRole("superusuario"));
});

// Configurar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ExtraHours API",
        Version = "v1",
        Description = "API para gestionar horas extra y usuarios.",
        Contact = new OpenApiContact
        {
            Name = "Jaime Gallo",
            Email = "jagallob@eafit.edu.co",
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("ProductionCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();