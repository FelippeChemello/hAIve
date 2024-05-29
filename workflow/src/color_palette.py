from PIL import Image, ImageFont, ImageDraw

colors = [
    {
        "bg": "#151B25",
        "fg": "#214358",
        "text": "#fcbe11"
    },
    {
        "bg": "#2F4B26",
        "fg": "#3E885B",
        "text": "#fcbe11"
    },
    {
        "bg": "#8D99AE",
        "fg": "#2B2D42",
        "text": "#fed439"
    },
    {
        "bg": "#335C67",   
        "fg": "#FFF3B0",   
        "text": "#292F36"  
    },
    {
        "bg": "#086788",   
        "fg": "#F0C808",   
        "text": "#DD1C1A"  
    },
    {
        "bg": "#101820",   
        "fg": "#F2AA4C",   
        "text": "#0d0d0d"  
    },
    {
        "bg": "#342E37", 
        "fg": "#D9B8C4", 
        "text": "#EDE6F2"
    },
    {
        "bg": "#584B53", 
        "fg": "#ECB390", 
        "text": "#01f"
    },
    {
        "bg": "#16262E", 
        "fg": "#FF7F11", 
        "text": "#F1F1F1"
    },
    {
        "bg": "#1F2041", 
        "fg": "#4B3F72", 
        "text": "#FFC857"
    },
    {
        "bg": "#05668D", 
        "fg": "#00A896", 
        "text": "#F7F4F3"
    },
    {
        "bg": "#540D6E", 
        "fg": "#EE4266", 
        "text": "#F3FCF0"
    },
    {
        "bg": "#004346", 
        "fg": "#FFD166", 
        "text": "#0A0908"
    },
    {
        "bg": "#00072D", 
        "fg": "#001C55", 
        "text": "#FFF"
    },
    {
        "bg": "#2B2D42", 
        "fg": "#8D99AE", 
        "text": "#EDF2F4"
    },
    {
        "bg": "#3A606E", 
        "fg": "#D9FFF7", 
        "text": "#1F363D"
    },
    {
        "bg": "#4A5043", 
        "fg": "#9DB5B2", 
        "text": "#FFFFFF"
    },
    {
        "bg": "#243010", 
        "fg": "#87A330", 
        "text": "#F4F4F9"
    },
    {
        "bg": "#7B1E7A", 
        "fg": "#B33F62", 
        "text": "#F4E4C1"
    },
    {
        "bg": "#1A281F", 
        "fg": "#606C38", 
        "text": "#FEF5ED"
    },
    {
        "bg": "#352208", 
        "fg": "#7B4B3A", 
        "text": "#FDF0D5"
    },
    {
        "bg": "#0A2239", 
        "fg": "#53B3CB", 
        "text": "#F0F0F0"
    },
    {
        "bg": "#462255", 
        "fg": "#FFC857", 
        "text": "#5CDB95"
    },
    {
        "bg": "#222222", 
        "fg": "#AAAAAA", 
        "text": "#000000"
    },
    {
        "bg": "#2E294E", 
        "fg": "#541388", 
        "text": "#F1E9DA"
    },
    {"bg": "#262626", "fg": "#F2AA4C", "text": "#101820"},  
    {"bg": "#073B4C", "fg": "#FFD166", "text": "#0A0908"},  
    {"bg": "#1A1423", "fg": "#D72638", "text": "#F1F1F1"},  
    {"bg": "#1F1B2D", "fg": "#4B3F72", "text": "#EDE6F2"},  
    {"bg": "#011627", "fg": "#00A896", "text": "#FDFFFC"},  
    {"bg": "#0D1821", "fg": "#FF7F11", "text": "#FFF8F0"},  
    {"bg": "#2F4858", "fg": "#33658A", "text": "#F6F5F5"},  
    {"bg": "#231F20", "fg": "#FFBA49", "text": "#F5F3F4"},  
    {"bg": "#1C0F13", "fg": "#FF5964", "text": "#FAF9F6"},  
    {"bg": "#263859", "fg": "#6B9080", "text": "#F8F9F9"},  
    {"bg": "#353535", "fg": "#8A84E2", "text": "#EDEDED"},  
    {"bg": "#393E41", "fg": "#44BBA4", "text": "#E7F6F2"},  
    {"bg": "#2B2D42", "fg": "#8D99AE", "text": "#E5E5E5"},  
    {"bg": "#00334E", "fg": "#145DA0", "text": "#FFFFFF"},  
    {"bg": "#303633", "fg": "#F06449", "text": "#E4E6E7"},  
    {"bg": "#423E37", "fg": "#A2A2A1", "text": "#F2F2F2"},  
    {"bg": "#2E294E", "fg": "#9E4770", "text": "#FBF9FA"}  
]

def get_random_color():
    import random
    return random.choice(colors)

if __name__ == "__main__":
    for color in colors:
        image = Image.new('RGB', (1080, 720), color=color["bg"])
        d = ImageDraw.Draw(image)
        d.rounded_rectangle([10, 10, 1070, 360], outline=color["fg"], fill=color["fg"], radius=8)
        font = ImageFont.truetype('assets/Roboto-Regular.ttf', 100)
        d.text((20, 20), "Hello, World!", fill=color["text"], font=font)
        image.save(f"thumbnail_{color['bg'][1:]}.png")