/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var protocolMap = {
    "0":{
        "value":"0",
        "name":"HOPOPT",
        "description":"IPv6 Hop-by-Hop Option"
    },
    "1":{
        "value":"1",
        "name":"ICMP",
        "description":"Internet Control Message"
    },
    "2":{
        "value":"2",
        "name":"IGMP",
        "description":"Internet Group Management"
    },
    "3":{
        "value":"3",
        "name":"GGP",
        "description":"Gateway-to-Gateway"
    },
    "4":{
        "value":"4",
        "name":"IPv4",
        "description":"IPv4 encapsulation"
    },
    "5":{
        "value":"5",
        "name":"ST",
        "description":"Stream"
    },
    "6":{
        "value":"6",
        "name":"TCP",
        "description":"Transmission Control"
    },
    "7":{
        "value":"7",
        "name":"CBT",
        "description":"CBT"
    },
    "8":{
        "value":"8",
        "name":"EGP",
        "description":"Exterior Gateway Protocol"
    },
    "9":{
        "value":"9",
        "name":"IGP",
        "description":"Any private interior Gateway"
    },
    "10":{
        "value":"10",
        "name":"BBN-RCC-MON",
        "description":"BBN RCC Monitoring"
    },
    "11":{
        "value":"11",
        "name":"NVP-II",
        "description":"Network Voice Protocol"
    },
    "12":{
        "value":"12",
        "name":"PUP",
        "description":"PUP"
    },
    "13":{
        "value":"13",
        "name":"ARGUS",
        "description":"ARGUS"
    },
    "14":{
        "value":"14",
        "name":"EMCON",
        "description":"EMCON"
    },
    "15":{
        "value":"15",
        "name":"XNET",
        "description":"Cross Net Debugger"
    },
    "16":{
        "value":"16",
        "name":"CHAOS",
        "description":"Chaos"
    },
    "17":{
        "value":"17",
        "name":"UDP",
        "description":"User Datagram"
    },
    "18":{
        "value":"18",
        "name":"MUX",
        "description":"Multiplexing"
    },
    "19":{
        "value":"19",
        "name":"DCN-MEAS",
        "description":"DCN Measurement Subsystems"
    },
    "20":{
        "value":"20",
        "name":"HMP",
        "description":"Host Monitoring"
    },
    "21":{
        "value":"21",
        "name":"PRM",
        "description":"Packet Radio Measurement"
    },
    "22":{
        "value":"22",
        "name":"XNS-IDP",
        "description":"XEROX NS IDP"
    },
    "23":{
        "value":"23",
        "name":"TRUNK-1",
        "description":"Trunk-1"
    },
    "24":{
        "value":"24",
        "name":"TRUNK-2",
        "description":"Trunk-2"
    },
    "25":{
        "value":"25",
        "name":"LEAF-1",
        "description":"Leaf-1"
    },
    "26":{
        "value":"26",
        "name":"LEAF-2",
        "description":"Leaf-2"
    },
    "27":{
        "value":"27",
        "name":"RDP",
        "description":"Reliable Data Protocol"
    },
    "28":{
        "value":"28",
        "name":"IRTP",
        "description":"Internet Reliable Transaction"
    },
    "29":{
        "value":"29",
        "name":"ISO-TP4",
        "description":"ISO Transport Protocol Class 4"
    },
    "30":{
        "value":"30",
        "name":"NETBLT",
        "description":"Bulk Data Transfer Protocol"
    },
    "31":{
        "value":"31",
        "name":"MFE-NSP",
        "description":"MFE Network Services Protocol"
    },
    "32":{
        "value":"32",
        "name":"MERIT-INP",
        "description":"MERIT Internodal Protocol"
    },
    "33":{
        "value":"33",
        "name":"DCCP",
        "description":"Datagram Congestion Control Protocol"
    },
    "34":{
        "value":"34",
        "name":"3PC",
        "description":"Third Party Connect Protocol"
    },
    "35":{
        "value":"35",
        "name":"IDPR",
        "description":"Inter-Domain Policy Routing Protocol"
    },
    "36":{
        "value":"36",
        "name":"XTP",
        "description":"XTP"
    },
    "37":{
        "value":"37",
        "name":"DDP",
        "description":"Datagram Delivery Protocol"
    },
    "38":{
        "value":"38",
        "name":"IDPR-CMTP",
        "description":"IDPR Control Message Transport Proto"
    },
    "39":{
        "value":"39",
        "name":"TP++",
        "description":"TP++ Transport Protocol"
    },
    "40":{
        "value":"40",
        "name":"IL",
        "description":"IL Transport Protocol"
    },
    "41":{
        "value":"41",
        "name":"IPv6",
        "description":"IPv6 encapsulation"
    },
    "42":{
        "value":"42",
        "name":"SDRP",
        "description":"Source Demand Routing Protocol"
    },
    "43":{
        "value":"43",
        "name":"IPv6-Route",
        "description":"Routing Header for IPv6"
    },
    "44":{
        "value":"44",
        "name":"IPv6-Frag",
        "description":"Fragment Header for IPv6"
    },
    "45":{
        "value":"45",
        "name":"IDRP",
        "description":"Inter-Domain Routing Protocol"
    },
    "46":{
        "value":"46",
        "name":"RSVP",
        "description":"Reservation Protocol"
    },
    "47":{
        "value":"47",
        "name":"GRE",
        "description":"Generic Routing Encapsulation"
    },
    "48":{
        "value":"48",
        "name":"DSR",
        "description":"Dynamic Source Routing Protocol"
    },
    "49":{
        "value":"49",
        "name":"BNA",
        "description":"BNA"
    },
    "50":{
        "value":"50",
        "name":"ESP",
        "description":"Encap Security Payload"
    },
    "51":{
        "value":"51",
        "name":"AH",
        "description":"Authentication Header"
    },
    "52":{
        "value":"52",
        "name":"I-NLSP",
        "description":"Integrated Net Layer Security  TUBA"
    },
    "53":{
        "value":"53",
        "name":"SWIPE",
        "description":"IP with Encryption"
    },
    "54":{
        "value":"54",
        "name":"NARP",
        "description":"NBMA Address Resolution Protocol"
    },
    "55":{
        "value":"55",
        "name":"MOBILE",
        "description":"IP Mobility"
    },
    "56":{
        "value":"56",
        "name":"TLSP"
    },
    "57":{
        "value":"57",
        "name":"SKIP",
        "description":"SKIP"
    },
    "58":{
        "value":"58",
        "name":"IPv6-ICMP",
        "description":"ICMP for IPv6"
    },
    "59":{
        "value":"59",
        "name":"IPv6-NoNxt",
        "description":"No Next Header for IPv6"
    },
    "60":{
        "value":"60",
        "name":"IPv6-Opts",
        "description":"Destination Options for IPv6"
    },
    "62":{
        "value":"62",
        "name":"CFTP",
        "description":"CFTP"
    },
    "64":{
        "value":"64",
        "name":"SAT-EXPAK",
        "description":"SATNET and Backroom EXPAK"
    },
    "65":{
        "value":"65",
        "name":"KRYPTOLAN",
        "description":"Kryptolan"
    },
    "66":{
        "value":"66",
        "name":"RVD",
        "description":"MIT Remote Virtual Disk Protocol"
    },
    "67":{
        "value":"67",
        "name":"IPPC",
        "description":"Internet Pluribus Packet Core"
    },
    "69":{
        "value":"69",
        "name":"SAT-MON",
        "description":"SATNET Monitoring"
    },
    "70":{
        "value":"70",
        "name":"VISA",
        "description":"VISA Protocol"
    },
    "71":{
        "value":"71",
        "name":"IPCV",
        "description":"Internet Packet Core Utility"
    },
    "72":{
        "value":"72",
        "name":"CPNX",
        "description":"Computer Protocol Network Executive"
    },
    "73":{
        "value":"73",
        "name":"CPHB",
        "description":"Computer Protocol Heart Beat"
    },
    "74":{
        "value":"74",
        "name":"WSN",
        "description":"Wang Span Network"
    },
    "75":{
        "value":"75",
        "name":"PVP",
        "description":"Packet Video Protocol"
    },
    "76":{
        "value":"76",
        "name":"BR-SAT-MON",
        "description":"Backroom SATNET Monitoring"
    },
    "77":{
        "value":"77",
        "name":"SUN-ND",
        "description":"SUN ND PROTOCOL-Temporary"
    },
    "78":{
        "value":"78",
        "name":"WB-MON",
        "description":"WIDEBAND Monitoring"
    },
    "79":{
        "value":"79",
        "name":"WB-EXPAK",
        "description":"WIDEBAND EXPAK"
    },
    "80":{
        "value":"80",
        "name":"ISO-IP",
        "description":"ISO Internet Protocol"
    },
    "81":{
        "value":"81",
        "name":"VMTP",
        "description":"VMTP"
    },
    "82":{
        "value":"82",
        "name":"SECURE-VMTP",
        "description":"SECURE-VMTP"
    },
    "83":{
        "value":"83",
        "name":"VINES",
        "description":"VINES"
    },
    "84":{
        "value":"84",
        "name":"IPTM",
        "description":"Protocol Internet Protocol Traffic Manager"
    },
    "85":{
        "value":"85",
        "name":"NSFNET-IGP",
        "description":"NSFNET-IGP"
    },
    "86":{
        "value":"86",
        "name":"DGP",
        "description":"Dissimilar Gateway Protocol"
    },
    "87":{
        "value":"87",
        "name":"TCF",
        "description":"TCF"
    },
    "88":{
        "value":"88",
        "name":"EIGRP",
        "description":"EIGRP"
    },
    "89":{
        "value":"89",
        "name":"OSPFIGP",
        "description":"OSPFIGP"
    },
    "90":{
        "value":"90",
        "name":"Sprite-RPC",
        "description":"Sprite RPC Protocol"
    },
    "91":{
        "value":"91",
        "name":"LARP",
        "description":"Locus Address Resolution Protocol"
    },
    "92":{
        "value":"92",
        "name":"MTP",
        "description":"Multicast Transport Protocol"
    },
    "93":{
        "value":"93",
        "name":"AX.25",
        "description":"AX.25 Frames"
    },
    "94":{
        "value":"94",
        "name":"IPIP",
        "description":"IP-within-IP Encapsulation Protocol"
    },
    "95":{
        "value":"95",
        "name":"MICP",
        "description":"Mobile Internetworking Control Pro."
    },
    "96":{
        "value":"96",
        "name":"SCC-SP",
        "description":"Semaphore Communications Sec. Pro."
    },
    "97":{
        "value":"97",
        "name":"ETHERIP",
        "description":"Ethernet-within-IP Encapsulation"
    },
    "98":{
        "value":"98",
        "name":"ENCAP",
        "description":"Encapsulation Header"
    },
    "100":{
        "value":"100",
        "name":"GMTP",
        "description":"GMTP"
    },
    "101":{
        "value":"101",
        "name":"IFMP",
        "description":"Ipsilon Flow Management Protocol"
    },
    "102":{
        "value":"102",
        "name":"PNNI",
        "description":"PNNI over IP"
    },
    "103":{
        "value":"103",
        "name":"PIM",
        "description":"Protocol Independent Multicast"
    },
    "104":{
        "value":"104",
        "name":"ARIS",
        "description":"ARIS"
    },
    "105":{
        "value":"105",
        "name":"SCPS",
        "description":"SCPS"
    },
    "106":{
        "value":"106",
        "name":"QNX",
        "description":"QNX"
    },
    "107":{
        "value":"107",
        "name":"A/N",
        "description":"Active Networks"
    },
    "108":{
        "value":"108",
        "name":"IPComp",
        "description":"IP Payload Compression Protocol"
    },
    "109":{
        "value":"109",
        "name":"SNP",
        "description":"Sitara Networks Protocol"
    },
    "110":{
        "value":"110",
        "name":"Compaq-Peer",
        "description":"Compaq Peer Protocol"
    },
    "111":{
        "value":"111",
        "name":"IPX-in-IP",
        "description":"IPX in IP"
    },
    "112":{
        "value":"112",
        "name":"VRRP",
        "description":"Virtual Router Redundancy Protocol"
    },
    "113":{
        "value":"113",
        "name":"PGM",
        "description":"PGM Reliable Transport Protocol"
    },
    "115":{
        "value":"115",
        "name":"L2TP",
        "description":"Layer Two Tunneling Protocol"
    },
    "116":{
        "value":"116",
        "name":"DDX",
        "description":"D-II Data Exchange (DDX)"
    },
    "117":{
        "value":"117",
        "name":"IATP",
        "description":"Interactive Agent Transfer Protocol"
    },
    "118":{
        "value":"118",
        "name":"STP",
        "description":"Schedule Transfer Protocol"
    },
    "119":{
        "value":"119",
        "name":"SRP",
        "description":"SpectraLink Radio Protocol"
    },
    "120":{
        "value":"120",
        "name":"UTI",
        "description":"UTI"
    },
    "121":{
        "value":"121",
        "name":"SMP",
        "description":"Simple Message Protocol"
    },
    "122":{
        "value":"122",
        "name":"SM",
        "description":"SM"
    },
    "123":{
        "value":"123",
        "name":"PTP",
        "description":"Performance Transparency Protocol"
    },
    "126":{
        "value":"126",
        "name":"CRTP",
        "description":"Combat Radio Transport Protocol"
    },
    "127":{
        "value":"127",
        "name":"CRUDP",
        "description":"Combat Radio User Datagram"
    },
    "128":{
        "value":"128",
        "name":"SSCOPMCE"
    },
    "129":{
        "value":"129",
        "name":"IPLT"
    },
    "130":{
        "value":"130",
        "name":"SPS",
        "description":"Secure Packet Shield"
    },
    "131":{
        "value":"131",
        "name":"PIPE",
        "description":"Private IP Encapsulation within IP"
    },
    "132":{
        "value":"132",
        "name":"SCTP",
        "description":"Stream Control Transmission Protocol"
    },
    "133":{
        "value":"133",
        "name":"FC",
        "description":"Fibre Channel"
    },
    "134":{
        "value":"134",
        "name":"RSVP-E2E-IGNORE"
    },
    "135":{
        "value":"135",
        "name":"Mobility Header"
    },
    "136":{
        "value":"136",
        "name":"UDPLite"
    },
    "137":{
        "value":"137",
        "name":"MPLS-in-IP"
    },
    "138":{
        "value":"138",
        "name":"manet",
        "description":"MANET Protocols"
    },
    "139":{
        "value":"139",
        "name":"HIP",
        "description":"Host Identity Protocol"
    },
    "140":{
        "value":"140",
        "name":"Shim6",
        "description":"Shim6 Protocol"
    },
    "141":{
        "value":"141",
        "name":"WESP",
        "description":"Wrapped Encapsulating Security Payload"
    },
    "142":{
        "value":"142",
        "name":"ROHC",
        "description":"Robust Header Compression"
    },
    "255":{
        "value":"255",
        "name":"Reserved"
    }
};

var protocolList = [
    {
        "value":"0",
        "name":"HOPOPT",
        "description":"IPv6 Hop-by-Hop Option"
    },
    {
        "value":"1",
        "name":"ICMP",
        "description":"Internet Control Message"
    },
    {
        "value":"2",
        "name":"IGMP",
        "description":"Internet Group Management"
    },
    {
        "value":"3",
        "name":"GGP",
        "description":"Gateway-to-Gateway"
    },
    {
        "value":"4",
        "name":"IPv4",
        "description":"IPv4 encapsulation"
    },
    {
        "value":"5",
        "name":"ST",
        "description":"Stream"
    },
    {
        "value":"6",
        "name":"TCP",
        "description":"Transmission Control"
    },
    {
        "value":"7",
        "name":"CBT",
        "description":"CBT"
    },
    {
        "value":"8",
        "name":"EGP",
        "description":"Exterior Gateway Protocol"
    },
    {
        "value":"9",
        "name":"IGP",
        "description":"Any private interior Gateway"
    },
    {
        "value":"10",
        "name":"BBN-RCC-MON",
        "description":"BBN RCC Monitoring"
    },
    {
        "value":"11",
        "name":"NVP-II",
        "description":"Network Voice Protocol"
    },
    {
        "value":"12",
        "name":"PUP",
        "description":"PUP"
    },
    {
        "value":"13",
        "name":"ARGUS",
        "description":"ARGUS"
    },
    {
        "value":"14",
        "name":"EMCON",
        "description":"EMCON"
    },
    {
        "value":"15",
        "name":"XNET",
        "description":"Cross Net Debugger"
    },
    {
        "value":"16",
        "name":"CHAOS",
        "description":"Chaos"
    },
    {
        "value":"17",
        "name":"UDP",
        "description":"User Datagram"
    },
    {
        "value":"18",
        "name":"MUX",
        "description":"Multiplexing"
    },
    {
        "value":"19",
        "name":"DCN-MEAS",
        "description":"DCN Measurement Subsystems"
    },
    {
        "value":"20",
        "name":"HMP",
        "description":"Host Monitoring"
    },
    {
        "value":"21",
        "name":"PRM",
        "description":"Packet Radio Measurement"
    },
    {
        "value":"22",
        "name":"XNS-IDP",
        "description":"XEROX NS IDP"
    },
    {
        "value":"23",
        "name":"TRUNK-1",
        "description":"Trunk-1"
    },
    {
        "value":"24",
        "name":"TRUNK-2",
        "description":"Trunk-2"
    },
    {
        "value":"25",
        "name":"LEAF-1",
        "description":"Leaf-1"
    },
    {
        "value":"26",
        "name":"LEAF-2",
        "description":"Leaf-2"
    },
    {
        "value":"27",
        "name":"RDP",
        "description":"Reliable Data Protocol"
    },
    {
        "value":"28",
        "name":"IRTP",
        "description":"Internet Reliable Transaction"
    },
    {
        "value":"29",
        "name":"ISO-TP4",
        "description":"ISO Transport Protocol Class 4"
    },
    {
        "value":"30",
        "name":"NETBLT",
        "description":"Bulk Data Transfer Protocol"
    },
    {
        "value":"31",
        "name":"MFE-NSP",
        "description":"MFE Network Services Protocol"
    },
    {
        "value":"32",
        "name":"MERIT-INP",
        "description":"MERIT Internodal Protocol"
    },
    {
        "value":"33",
        "name":"DCCP",
        "description":"Datagram Congestion Control Protocol"
    },
    {
        "value":"34",
        "name":"3PC",
        "description":"Third Party Connect Protocol"
    },
    {
        "value":"35",
        "name":"IDPR",
        "description":"Inter-Domain Policy Routing Protocol"
    },
    {
        "value":"36",
        "name":"XTP",
        "description":"XTP"
    },
    {
        "value":"37",
        "name":"DDP",
        "description":"Datagram Delivery Protocol"
    },
    {
        "value":"38",
        "name":"IDPR-CMTP",
        "description":"IDPR Control Message Transport Proto"
    },
    {
        "value":"39",
        "name":"TP++",
        "description":"TP++ Transport Protocol"
    },
    {
        "value":"40",
        "name":"IL",
        "description":"IL Transport Protocol"
    },
    {
        "value":"41",
        "name":"IPv6",
        "description":"IPv6 encapsulation"
    },
    {
        "value":"42",
        "name":"SDRP",
        "description":"Source Demand Routing Protocol"
    },
    {
        "value":"43",
        "name":"IPv6-Route",
        "description":"Routing Header for IPv6"
    },
    {
        "value":"44",
        "name":"IPv6-Frag",
        "description":"Fragment Header for IPv6"
    },
    {
        "value":"45",
        "name":"IDRP",
        "description":"Inter-Domain Routing Protocol"
    },
    {
        "value":"46",
        "name":"RSVP",
        "description":"Reservation Protocol"
    },
    {
        "value":"47",
        "name":"GRE",
        "description":"Generic Routing Encapsulation"
    },
    {
        "value":"48",
        "name":"DSR",
        "description":"Dynamic Source Routing Protocol"
    },
    {
        "value":"49",
        "name":"BNA",
        "description":"BNA"
    },
    {
        "value":"50",
        "name":"ESP",
        "description":"Encap Security Payload"
    },
    {
        "value":"51",
        "name":"AH",
        "description":"Authentication Header"
    },
    {
        "value":"52",
        "name":"I-NLSP",
        "description":"Integrated Net Layer Security  TUBA"
    },
    {
        "value":"53",
        "name":"SWIPE",
        "description":"IP with Encryption"
    },
    {
        "value":"54",
        "name":"NARP",
        "description":"NBMA Address Resolution Protocol"
    },
    {
        "value":"55",
        "name":"MOBILE",
        "description":"IP Mobility"
    },
    {
        "value":"56",
        "name":"TLSP"
    },
    {
        "value":"57",
        "name":"SKIP",
        "description":"SKIP"
    },
    {
        "value":"58",
        "name":"IPv6-ICMP",
        "description":"ICMP for IPv6"
    },
    {
        "value":"59",
        "name":"IPv6-NoNxt",
        "description":"No Next Header for IPv6"
    },
    {
        "value":"60",
        "name":"IPv6-Opts",
        "description":"Destination Options for IPv6"
    },
    {
        "value":"62",
        "name":"CFTP",
        "description":"CFTP"
    },
    {
        "value":"64",
        "name":"SAT-EXPAK",
        "description":"SATNET and Backroom EXPAK"
    },
    {
        "value":"65",
        "name":"KRYPTOLAN",
        "description":"Kryptolan"
    },
    {
        "value":"66",
        "name":"RVD",
        "description":"MIT Remote Virtual Disk Protocol"
    },
    {
        "value":"67",
        "name":"IPPC",
        "description":"Internet Pluribus Packet Core"
    },
    {
        "value":"69",
        "name":"SAT-MON",
        "description":"SATNET Monitoring"
    },
    {
        "value":"70",
        "name":"VISA",
        "description":"VISA Protocol"
    },
    {
        "value":"71",
        "name":"IPCV",
        "description":"Internet Packet Core Utility"
    },
    {
        "value":"72",
        "name":"CPNX",
        "description":"Computer Protocol Network Executive"
    },
    {
        "value":"73",
        "name":"CPHB",
        "description":"Computer Protocol Heart Beat"
    },
    {
        "value":"74",
        "name":"WSN",
        "description":"Wang Span Network"
    },
    {
        "value":"75",
        "name":"PVP",
        "description":"Packet Video Protocol"
    },
    {
        "value":"76",
        "name":"BR-SAT-MON",
        "description":"Backroom SATNET Monitoring"
    },
    {
        "value":"77",
        "name":"SUN-ND",
        "description":"SUN ND PROTOCOL-Temporary"
    },
    {
        "value":"78",
        "name":"WB-MON",
        "description":"WIDEBAND Monitoring"
    },
    {
        "value":"79",
        "name":"WB-EXPAK",
        "description":"WIDEBAND EXPAK"
    },
    {
        "value":"80",
        "name":"ISO-IP",
        "description":"ISO Internet Protocol"
    },
    {
        "value":"81",
        "name":"VMTP",
        "description":"VMTP"
    },
    {
        "value":"82",
        "name":"SECURE-VMTP",
        "description":"SECURE-VMTP"
    },
    {
        "value":"83",
        "name":"VINES",
        "description":"VINES"
    },
    {
        "value":"84",
        "name":"IPTM",
        "description":"Protocol Internet Protocol Traffic Manager"
    },
    {
        "value":"85",
        "name":"NSFNET-IGP",
        "description":"NSFNET-IGP"
    },
    {
        "value":"86",
        "name":"DGP",
        "description":"Dissimilar Gateway Protocol"
    },
    {
        "value":"87",
        "name":"TCF",
        "description":"TCF"
    },
    {
        "value":"88",
        "name":"EIGRP",
        "description":"EIGRP"
    },
    {
        "value":"89",
        "name":"OSPFIGP",
        "description":"OSPFIGP"
    },
    {
        "value":"90",
        "name":"Sprite-RPC",
        "description":"Sprite RPC Protocol"
    },
    {
        "value":"91",
        "name":"LARP",
        "description":"Locus Address Resolution Protocol"
    },
    {
        "value":"92",
        "name":"MTP",
        "description":"Multicast Transport Protocol"
    },
    {
        "value":"93",
        "name":"AX.25",
        "description":"AX.25 Frames"
    },
    {
        "value":"94",
        "name":"IPIP",
        "description":"IP-within-IP Encapsulation Protocol"
    },
    {
        "value":"95",
        "name":"MICP",
        "description":"Mobile Internetworking Control Pro."
    },
    {
        "value":"96",
        "name":"SCC-SP",
        "description":"Semaphore Communications Sec. Pro."
    },
    {
        "value":"97",
        "name":"ETHERIP",
        "description":"Ethernet-within-IP Encapsulation"
    },
    {
        "value":"98",
        "name":"ENCAP",
        "description":"Encapsulation Header"
    },
    {
        "value":"100",
        "name":"GMTP",
        "description":"GMTP"
    },
    {
        "value":"101",
        "name":"IFMP",
        "description":"Ipsilon Flow Management Protocol"
    },
    {
        "value":"102",
        "name":"PNNI",
        "description":"PNNI over IP"
    },
    {
        "value":"103",
        "name":"PIM",
        "description":"Protocol Independent Multicast"
    },
    {
        "value":"104",
        "name":"ARIS",
        "description":"ARIS"
    },
    {
        "value":"105",
        "name":"SCPS",
        "description":"SCPS"
    },
    {
        "value":"106",
        "name":"QNX",
        "description":"QNX"
    },
    {
        "value":"107",
        "name":"A/N",
        "description":"Active Networks"
    },
    {
        "value":"108",
        "name":"IPComp",
        "description":"IP Payload Compression Protocol"
    },
    {
        "value":"109",
        "name":"SNP",
        "description":"Sitara Networks Protocol"
    },
    {
        "value":"110",
        "name":"Compaq-Peer",
        "description":"Compaq Peer Protocol"
    },
    {
        "value":"111",
        "name":"IPX-in-IP",
        "description":"IPX in IP"
    },
    {
        "value":"112",
        "name":"VRRP",
        "description":"Virtual Router Redundancy Protocol"
    },
    {
        "value":"113",
        "name":"PGM",
        "description":"PGM Reliable Transport Protocol"
    },
    {
        "value":"115",
        "name":"L2TP",
        "description":"Layer Two Tunneling Protocol"
    },
    {
        "value":"116",
        "name":"DDX",
        "description":"D-II Data Exchange (DDX)"
    },
    {
        "value":"117",
        "name":"IATP",
        "description":"Interactive Agent Transfer Protocol"
    },
    {
        "value":"118",
        "name":"STP",
        "description":"Schedule Transfer Protocol"
    },
    {
        "value":"119",
        "name":"SRP",
        "description":"SpectraLink Radio Protocol"
    },
    {
        "value":"120",
        "name":"UTI",
        "description":"UTI"
    },
    {
        "value":"121",
        "name":"SMP",
        "description":"Simple Message Protocol"
    },
    {
        "value":"122",
        "name":"SM",
        "description":"SM"
    },
    {
        "value":"123",
        "name":"PTP",
        "description":"Performance Transparency Protocol"
    },
    {
        "value":"126",
        "name":"CRTP",
        "description":"Combat Radio Transport Protocol"
    },
    {
        "value":"127",
        "name":"CRUDP",
        "description":"Combat Radio User Datagram"
    },
    {
        "value":"128",
        "name":"SSCOPMCE"
    },
    {
        "value":"129",
        "name":"IPLT"
    },
    {
        "value":"130",
        "name":"SPS",
        "description":"Secure Packet Shield"
    },
    {
        "value":"131",
        "name":"PIPE",
        "description":"Private IP Encapsulation within IP"
    },
    {
        "value":"132",
        "name":"SCTP",
        "description":"Stream Control Transmission Protocol"
    },
    {
        "value":"133",
        "name":"FC",
        "description":"Fibre Channel"
    },
    {
        "value":"134",
        "name":"RSVP-E2E-IGNORE"
    },
    {
        "value":"135",
        "name":"Mobility Header"
    },
    {
        "value":"136",
        "name":"UDPLite"
    },
    {
        "value":"137",
        "name":"MPLS-in-IP"
    },
    {
        "value":"138",
        "name":"manet",
        "description":"MANET Protocols"
    },
    {
        "value":"139",
        "name":"HIP",
        "description":"Host Identity Protocol"
    },
    {
        "value":"140",
        "name":"Shim6",
        "description":"Shim6 Protocol"
    },
    {
        "value":"141",
        "name":"WESP",
        "description":"Wrapped Encapsulating Security Payload"
    },
    {
        "value":"142",
        "name":"ROHC",
        "description":"Robust Header Compression"
    },
    {
        "value":"255",
        "name":"Reserved"
    }
];

function getProtocolName(protocolNumber) {
    var protocol = protocolMap[protocolNumber],
        protocolName;
    if (protocol != null) {
        protocolName = protocol['name'];
    } else {
        protocolName = protocolNumber;
    }
    return protocolName;
};