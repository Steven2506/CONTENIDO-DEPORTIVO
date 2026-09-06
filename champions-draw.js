window.officialChampionsDraw=`Paris|Barcelona,Roma,Galatasaray,S. Bratislava|Man City,Aston Villa,Villarreal,Como
Bayern München|Arsenal,Real Betis,Bodø/Glimt,Slavia Praha|Atleti,Man Utd,Lille,Viking
Real Madrid|Inter,PSV,Leipzig,LASK|Arsenal,Roma,Shakhtar,AEK Athens
Liverpool|Atleti,Porto,Villarreal,Lens|Inter,Club Brugge,Fenerbahçe,LASK
Inter|Liverpool,Club Brugge,Shakhtar,Stuttgart|Real Madrid,B. Dortmund,Feyenoord,S. Bratislava
Man City|Paris,Sporting CP,Napoli,AEK Athens|Barcelona,Porto,Leipzig,Lens
Arsenal|Real Madrid,B. Dortmund,Lille,Sabah|Bayern München,Real Betis,Napoli,Slavia Praha
Barcelona|Man City,Aston Villa,Feyenoord,Como|Paris,Sporting CP,Galatasaray,Sabah
Atleti|Bayern München,Man Utd,Fenerbahçe,Viking|Liverpool,PSV,Bodø/Glimt,Stuttgart
B. Dortmund|Inter,Real Betis,Villarreal,AEK Athens|Arsenal,Aston Villa,Bodø/Glimt,Sabah
Roma|Real Madrid,Sporting CP,Lille,S. Bratislava|Paris,Man Utd,Fenerbahçe,AEK Athens
Sporting CP|Barcelona,Man Utd,Galatasaray,LASK|Man City,Roma,Shakhtar,Lens
Aston Villa|Paris,B. Dortmund,Fenerbahçe,Viking|Barcelona,Club Brugge,Galatasaray,Slavia Praha
Porto|Man City,PSV,Napoli,Slavia Praha|Liverpool,Real Betis,Feyenoord,LASK
Man Utd|Bayern München,Roma,Leipzig,Sabah|Atleti,Sporting CP,Villarreal,Como
Club Brugge|Liverpool,Aston Villa,Bodø/Glimt,Lens|Inter,PSV,Napoli,Stuttgart
Real Betis|Arsenal,Porto,Feyenoord,Como|Bayern München,B. Dortmund,Lille,S. Bratislava
PSV|Atleti,Club Brugge,Shakhtar,Stuttgart|Real Madrid,Porto,Leipzig,Viking
Feyenoord|Inter,Porto,Leipzig,Como|Barcelona,Real Betis,Galatasaray,Viking
Lille|Bayern München,Real Betis,Galatasaray,S. Bratislava|Arsenal,Roma,Bodø/Glimt,Stuttgart
Bodø/Glimt|Atleti,B. Dortmund,Lille,LASK|Bayern München,Club Brugge,Napoli,Lens
Napoli|Arsenal,Club Brugge,Bodø/Glimt,Viking|Man City,Porto,Villarreal,Sabah
Leipzig|Man City,PSV,Shakhtar,Lens|Real Madrid,Man Utd,Feyenoord,Como
Villarreal|Paris,Man Utd,Napoli,Sabah|Liverpool,B. Dortmund,Fenerbahçe,Slavia Praha
Fenerbahçe|Liverpool,Roma,Villarreal,Slavia Praha|Atleti,Aston Villa,Shakhtar,LASK
Shakhtar|Real Madrid,Sporting CP,Fenerbahçe,AEK Athens|Inter,PSV,Leipzig,S. Bratislava
Galatasaray|Barcelona,Aston Villa,Feyenoord,Stuttgart|Paris,Sporting CP,Lille,AEK Athens
Slavia Praha|Arsenal,Aston Villa,Villarreal,Lens|Bayern München,Porto,Fenerbahçe,Sabah
S. Bratislava|Inter,Real Betis,Shakhtar,Stuttgart|Paris,Roma,Lille,LASK
Stuttgart|Atleti,Club Brugge,Lille,Viking|Inter,PSV,Galatasaray,S. Bratislava
AEK Athens|Real Madrid,Roma,Galatasaray,LASK|Man City,B. Dortmund,Shakhtar,Como
LASK|Liverpool,Porto,Fenerbahçe,S. Bratislava|Real Madrid,Sporting CP,Bodø/Glimt,AEK Athens
Como|Paris,Man Utd,Leipzig,AEK Athens|Barcelona,Real Betis,Feyenoord,Lens
Lens|Man City,Sporting CP,Bodø/Glimt,Como|Liverpool,Club Brugge,Leipzig,Slavia Praha
Viking|Bayern München,PSV,Feyenoord,Sabah|Atleti,Aston Villa,Napoli,Stuttgart
Sabah|Barcelona,B. Dortmund,Napoli,Slavia Praha|Arsenal,Man Utd,Villarreal,Viking`.trim().split("\n").map(line=>{const [team,home,away]=line.split("|");return{team,home:home.split(","),away:away.split(",")};});
