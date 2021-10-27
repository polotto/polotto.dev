---
title: "Asp Net Core Globalization"
date: 2021-10-27T09:01:11-03:00
draft: false
tags: ["c#"]
author: "Polotto"
showToc: false
TocOpen: false
hidemeta: false
comments: false
description: "The painful globalization of AST.NET Core 2.2"
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
---

ASP.NET is an amazing tool but always surprises me making things that should be easy, hard ones. Globalization of ASP.NET Core 2.2 is one of them.

After research the [official docs](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/localization?view=aspnetcore-2.2) a lot, I found my self in a dead end street. The same feeling was when I tried search something on Stack Overflow, basically all the solutions proposed didn't work.

Luckily, I found and [github issue](https://github.com/dotnet/aspnetcore/issues/18026) thread about globalization of ASP.NET Core 3.3. Inside it, a good soul [post a project](https://github.com/dotnet/aspnetcore/issues/18026#issuecomment-569940329) with working example.

My problem could be solved with following steps:

- Change the Startup.cs:

```cs
public void ConfigureServices(IServiceCollection services)
{
    //...
    services.AddLocalization(options => { options.ResourcesPath = "Resources"; });

    services.Configure<RequestLocalizationOptions>(options =>
    {
        var supportedCultures = new[]
        {
            new CultureInfo("en")
        };

        options.DefaultRequestCulture = new RequestCulture(culture: "en", uiCulture: "en");
        options.SupportedUICultures = supportedCultures;
        options.SupportedCultures = supportedCultures;
    });

    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
        .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix);
}
//...
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    //...
    app.UseRequestLocalization(app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>().Value);
    //...
}
```

- Create a folder called **Resources** in the root of the project to keep all the **resx** files and respect the structure:

```
Resources/NAME_OF_VIEW_FOLDER/NAME_OF_VIEW_SUBFOLDER/YourViewName.en.resx
```

- The **resx** file should respect this template:

```resx
<?xml version="1.0" encoding="utf-8"?>
<root>
  <xsd:schema id="root" xmlns="" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">
    <xsd:import namespace="http://www.w3.org/XML/1998/namespace" />
    <xsd:element name="root" msdata:IsDataSet="true">
      <xsd:complexType>
        <xsd:choice maxOccurs="unbounded">
          <xsd:element name="metadata">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name="value" type="xsd:string" minOccurs="0" />
              </xsd:sequence>
              <xsd:attribute name="name" use="required" type="xsd:string" />
              <xsd:attribute name="type" type="xsd:string" />
              <xsd:attribute name="mimetype" type="xsd:string" />
              <xsd:attribute ref="xml:space" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name="assembly">
            <xsd:complexType>
              <xsd:attribute name="alias" type="xsd:string" />
              <xsd:attribute name="name" type="xsd:string" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name="data">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name="value" type="xsd:string" minOccurs="0" msdata:Ordinal="1" />
                <xsd:element name="comment" type="xsd:string" minOccurs="0" msdata:Ordinal="2" />
              </xsd:sequence>
              <xsd:attribute name="name" type="xsd:string" use="required" msdata:Ordinal="1" />
              <xsd:attribute name="type" type="xsd:string" msdata:Ordinal="3" />
              <xsd:attribute name="mimetype" type="xsd:string" msdata:Ordinal="4" />
              <xsd:attribute ref="xml:space" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name="resheader">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name="value" type="xsd:string" minOccurs="0" msdata:Ordinal="1" />
              </xsd:sequence>
              <xsd:attribute name="name" type="xsd:string" use="required" />
            </xsd:complexType>
          </xsd:element>
        </xsd:choice>
      </xsd:complexType>
    </xsd:element>
  </xsd:schema>
  <resheader name="resmimetype">
    <value>text/microsoft-resx</value>
  </resheader>
  <resheader name="version">
    <value>2.0</value>
  </resheader>
  <resheader name="reader">
    <value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>
  <resheader name="writer">
    <value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>

  <!-- YOUR TEXT CONTENT -->
  <data name="Title" xml:space="preserve">
    <value>Hello World</value>
  </data>
</root>
```

- Call your string resources inside the **.cshtml**:

```cshtml
@using Microsoft.AspNetCore.Mvc.Localization
@using Microsoft.Extensions.Localization

@inject IViewLocalizer Localizer

<p>@Localizer["Title"]</p>
```

That's it, seems easy now but was hard put all peaces together.
