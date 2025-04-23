let EventPointName = {
    2 : "Buit",
    46 : "Tabletten",
    51 : "Tokens",
    44 : "Roem",
    58 : "Roem",
    6 : "Macht",
}

let Increment = {
    2: 10,
    46: 8,
    51: 8,
    44: 8,
    68: 8,
    6: 10,
}

const app = Vue.createApp({
    data() {
        return {
            players: [],
            allianceMemberRanking: [],
            allianceMembers: [],
            allianceName: "Praetorium",
            Succeed: {},
            Failed: {},
            loading: false, 
            ShowContent: false,
            newAllianceName: "Praetorium",
            error: "",
            allianceId: 52852, // The Gladiators ID: 229, The Stoics ID: 52862, Praetorium ID: 52852
            minimum: 1,
            newMinimum: 1,
            event: 2,
            newEvent: 2,
            PointName: 'Buit',
            PlayerName: "",
            newPlayerName: "",
            PlayerInfoShowing: false,
            PlayerInformation: {},
            showSearchResult: false,
        };
    },
    async mounted() {
        
    },
    methods: {
        async getAllRankings() {
            try {                
                const alliances = await fetch(`https://empire-api.fly.dev/EmpireEx_11/ain/%22AID%22:${this.allianceId}`);
                if (!alliances.ok) {
                    throw new Error(`HTTP error! status: ${alliances.status}`);
                }

                const atextData = await alliances.text();
                const ajsonData = JSON.parse(atextData);
        
                let Members = [];
                let MemberData = ajsonData.content.A.M;
        
                Members = MemberData
                    .map(member => ({
                        name: member.N,
                        ar: member.AR
                    }))
                    .sort((a, b) => {
                        if (a.ar !== b.ar) {
                            return a.ar - b.ar;
                        }
                        return a.name.localeCompare(b.name);
                    })
                    .map(member => member.name);
        
                let allPlayers = this.players;
                let AllianceMembers = [];

                allPlayers.forEach(Player => {
                    if (Player.allianceId === this.allianceId) {
                        AllianceMembers.push({
                            player: Player.player,
                            alliance: Player.alliance,
                            points: Player.points,
                            placement: Player.placement
                        });
                    }
                });
        
                let NoScore = {};
                NoScore = MemberData
                    .filter(member => !AllianceMembers.some(allianceMember => allianceMember.player === member.N))
                    .reduce((acc, member) => {
                        acc[member.N] = 0;
                        return acc;
                    }, {});
        
                let Succeed = {};
                let Failed = {};
        
                AllianceMembers.forEach(member => {
                    if (member.points > this.minimum) {
                        Succeed[member.player] = member.points;
                    } else {
                        Failed[member.player] = member.points;
                    }
                });
        
                for (const Member in NoScore) {
                    Failed[Member] = NoScore[Member];
                }

                this.allianceMemberRanking = AllianceMembers;
                this.allianceMembers = Members;
                this.Succeed = Succeed;
                this.Failed = Failed;
        
                console.log(`${Object.keys(Succeed).length + Object.keys(Failed).length}/${Object.keys(MemberData).length} scores found.`);
            } catch (error) {
                this.error = `Error fetching data: ${error.message}`;
            } finally {
                this.loading = false;
                this.ShowContent = true;
            }
        },
        
        async GetPlayers(GetRankings) {            
            this.loading = true;
        
            let allPlayers = [];
            var Repeats = 1;
        
            if (this.event === 46 || this.event === 44 || this.event === 58 || this.event === 51) {
                Repeats = 5;
            }

            this.PointName = EventPointName[this.event];
            const playerSet = new Set();

            const FetchDataForIndex = async (index, category) => {
                const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:${this.event},%22LID%22:${category},%22SV%22:%${index}%22`);
                const textData = await response.text();
                const jsonData = JSON.parse(textData);
        
                if (!jsonData.content) {
                    return null;
                }
        
                let playersData = jsonData.content.L;
        
                if (playersData[0] === null || playersData[0][1] === 0) {
                    return null;
                }

                playersData = playersData.filter(element => element[2].R !== 1); // Remove all inactive
        
                return playersData.map(player => ({
                    player: player[2].N,
                    alliance: player[2].AN,
                    allianceId: player[2].AID,
                    points: player[1]
                }));
            };
        
            for (let category = 1; category < Repeats + 1; category++) {
                if (this.event === 6) {
                    category = 6;
                }
        
                const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:${this.event},%22LID%22:${category},%22SV%22:%221%22`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const textData = await response.text();
                const jsonData = JSON.parse(textData);
                var Length = Math.ceil(jsonData.content.LR / Increment[this.event]) * Increment[this.event];
                var Done = false;
                var FetchedCount = 0;

                try {
                    const result = await FetchDataForIndex(221, category, true);
        
                    result.forEach(player => {
                        const playerIdentifier = player.player;
                        if (!playerSet.has(playerIdentifier)) {
                            playerSet.add(playerIdentifier);
                            allPlayers.push(player);
                        }
                    });
                } catch (error) {
                    console.log("Event not there");
                }
        
                for (let index = 2212; FetchedCount < Length && Done === false; index += Increment[this.event]) {
                    if (index >= 2300 && index < 2310) {
                        if (Increment[this.event] === 10 ){
                            index = 22105;
                        } else {
                            index = 22102;
                        }
                    }

                    if (index >= 23000 && index < 23010) {
                        if (Increment[this.event] === 10) {
                            index = 221005;
                        } else {
                            index = 221002;
                        }
                    }                    

                    FetchedCount = FetchedCount + Increment[this.event];
                    const result = await FetchDataForIndex(index, category);
        
                    if (result === null) {
                        Done = true;
                        continue;
                    }
        
                    result.forEach(player => {
                        const playerIdentifier = player.player;
                        if (!playerSet.has(playerIdentifier)) {
                            playerSet.add(playerIdentifier);
                            allPlayers.push(player);
                        }
                    });
                }
            }
        
            allPlayers.sort((a, b) => b.points - a.points);
        
            console.log(allPlayers);
        
            this.players = allPlayers;
            this.loading = false;
        
            if (GetRankings) {
                this.getAllRankings();
            }
        },

        async GetPlayer() {
            try {
                this.loading = true;

                const response = await fetch(`https://empire-api.fly.dev/EmpireEx_11/hgh/%22LT%22:6,%22LID%22:6,%22SV%22:%22${this.PlayerName}%22`);              

                const textData = await response.text();
                const jsonData = JSON.parse(textData);

                if (!jsonData.content) {
                    return null;
                }

                const playersData = jsonData.content.L;

                playersData.forEach(element => {
                    if (element[2].N === this.PlayerName) {

                        console.log(element)

                        this.PlayerInformation = {
                            "Macht: ": element[2].MP,
                            "Eer: ": element[2].H,
                            "BG: ": element[2].AN,
                        };
                    }
                });
            } catch (error) {
                console.log(error);
            } finally {
                console.log(this.PlayerInformation)

                this.loading = false;
                this.PlayerInfoShowing = true;
            }
        },
        
        async GetAllianceId() {
            var Id = 0;
            this.players.forEach(Player => {
                if (Player.alliance === this.allianceName) {
                    Id = Player.allianceId;
                }
            })

            return Promise.resolve(Id);
        },
        
        async ChangeAlliance() {
            const waitForLoading = setInterval(async () => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
        
                    if (this.newAllianceName) {
                        this.error = "";
        
                        this.allianceName = this.newAllianceName;
        
                        const NewAllianceId = await this.GetAllianceId();

                        if (NewAllianceId === 0) {
                            this.error = "Ongeldig BG."
                        } else {
                            this.allianceId = NewAllianceId;
                            this.getAllRankings();
                        }         
                    }
                }
            }, 100);
        },        

        async SetMinimum() {
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
                    if (this.newMinimum && typeof this.newMinimum === 'number' && this.newMinimum >= 0) {
                        this.minimum = this.newMinimum;
        
                        this.getAllRankings();
                    }
                }
            }, 100);
        },

        async SetPlayerSearch() {
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);

                    if (this.newPlayerName) {
                        this.PlayerInfoShowing = false;
                        this.PlayerName = this.newPlayerName;

                        this.showSearchResult = true;
        
                        this.GetPlayer();
                    }
                }
            }, 100);
        },        

        async SetEvent(){
            const waitForLoading = setInterval(() => {
                if (!this.loading) {
                    clearInterval(waitForLoading);
                    if (this.newEvent && typeof this.newEvent === 'number' && this.newEvent >= 0) {
                        if (this.newEvent !== this.event) {
                            this.event = this.newEvent;    
                            this.GetPlayers(true);
                        }

                        this.showSearchResult = false;
                    }
                }
            }, 100);
        },

        formatNumber(number) {
            if (typeof number !== 'number') {
                return number;
            }
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
        },
    }
});

app.mount("#app");
