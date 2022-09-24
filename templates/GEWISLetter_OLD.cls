%% GEWIS Briefpapier TeX Style
%% Stijl - Stephan van den Berkmortel, Gijs de Man, Rink Pieters

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{GEWISLetter}[2020/05/09 GEWIS Letter] %May 9, 2020 v1.0
\LoadClass[a4paper, 11pt]{article}

\usepackage{fancyhdr} % Correctly style header and footer of the GEWIS stationery
\usepackage{ifthen} % Allow if-statements
\usepackage{etoolbox} % Helper package for digital display of stationery
\usepackage{lastpage} % Only usage is to retrieve the final page number for page numbering
\usepackage{booktabs} % Better styling of tables, don't use vertical bars anymore
\usepackage{fontawesome} % Glyphs of association details in header
\usepackage{multirow} % Tabular alignment over multiple rows
\usepackage{changepage} % Allows to locally resize the margins
\usepackage{titlesec} % Adjust the formatting of sections, subsections etc.
\usepackage[gen]{eurosym} % Guess
\usepackage{xspace} % Automatically add whitespace after commands if necessary, no more need for "\Bla\ "
\usepackage[hidelinks, urlcolor=blue]{hyperref} % Interactive links for contact details
\usepackage{graphicx} %To insert pdf background
\usepackage{ocg-p} %Possibility to use layers - used for background hiding on print

%packages needed for page numbering
\usepackage{atenddvi}
\usepackage[user]{zref}

% Test packages
\usepackage{xcolor}
\definecolor{GEWISLightGray}{cmyk}{0, 0, 0, 0.05}
\definecolor{GEWISDarkGray}{cmyk}{0, 0, 0, 0.8}
\definecolor{GEWISGray}{cmyk}{0, 0, 0, 0.36}

% Deprecated packages
\usepackage{tabularx} % Used for old-style alignment of letter details
\usepackage{array} % Additional tabular column options
\newcolumntype{L}[1]{>{\raggedright\let\newline\\\arraybackslash\hspace{0pt}}m{#1}}

% Standard documentpackages
\usepackage[a4paper,
tmargin=47.5mm,
hmargin={33mm, 27mm},
headheight = 8mm,
headsep = 10mm,
height = 219.5mm,
footskip = 17.5mm,
nomarginpar,
%showframe, % Debugging purposes only
]{geometry}

% Font settings
\usepackage[T1]{fontenc} % Core package for T1 font encoding. Required for using lato font
\usepackage[default]{lato} % Loading the actual T1 font
\pdfmapfile{=lato.map}
\pdfmapfile{=fontawesome.map}

% Create digital option
\newtoggle{digital}
\togglefalse{digital}
\DeclareOption{digital}{\toggletrue{digital}}
\newtoggle{printletterhead}
\togglefalse{printletterhead}
\DeclareOption{printletterhead}{\toggletrue{digital} \toggletrue{printletterhead}}

\newcommand\@GEWISsa{Studievereniging}
\newcommand\@GEWIStue{Technische Universiteit Eindhoven}
\newcommand\@GEWISattn{T.a.v.}
\newcommand\@GEWISyourreference{Uw kenmerk}
\newcommand\@GEWISmyreference{Ons kenmerk}
\newcommand\@GEWISdate{Datum}
\newcommand\@GEWISsubject{Onderwerp}
\newcommand\@GEWISpage{Pagina\xspace}

\newcommand\@GEWISsendername{GEWIS}
\newcommand\@GEWISsendermail{board@gewis.nl}
\newcommand\@GEWISsenderphone{+31 40 247 2815}
\newcommand\@GEWISsenderweb{www.gewis.nl}

\newcommand\setSenderName[1]{
    \iftoggle{english}{
    \renewcommand\@GEWISsendername{#1 of}
    \renewcommand{\@GEWISsa}{Study association GEWIS}
    }{
    \renewcommand\@GEWISsendername{#1 der}
    \renewcommand{\@GEWISsa}{Studievereniging GEWIS}
    }
}
\newcommand\setSenderMail[1]{\renewcommand\@GEWISsendermail{#1}}
\newcommand\setSenderPhone[1]{\renewcommand\@GEWISsenderphone{#1}}
\newcommand\setSenderWeb[1]{\renewcommand\@GEWISsenderweb{#1}}

% Create english option
\newtoggle{english}
\togglefalse{english}
\DeclareOption{english}{
	\renewcommand{\@GEWISsa}{Study association}
	\renewcommand{\@GEWIStue}{Eindhoven University of Technology}
	\renewcommand{\@GEWISattn}{Attn.}
	\renewcommand{\@GEWISyourreference}{Your reference}
	\renewcommand{\@GEWISmyreference}{Our reference}
	\renewcommand{\@GEWISdate}{Date}
	\renewcommand{\@GEWISsubject}{Subject}
	\renewcommand{\@GEWISpage}{Page\xspace}

	\toggletrue{english}
}
\ProcessOptions

% Conditionally load correct language package, implemented in this format to correctly support \today
\iftoggle{english}{
	\usepackage[english]{babel} % Language hyphenation
}{
	\usepackage[dutch]{babel} % Language hyphenation
}

% Followup pages, section name in the header
\newcommand{\hd}[1]{
    \clearpage
    \lhead{
    {\bfseries\Large #1}
    }
}
\renewcommand{\section}[1]{
    \hd{#1}
}

% Variabeles for contact details
\newcommand\GEWISRecipient{Recipient}
\newcommand\GEWISattn{}
\newcommand\GEWISstreet{Straat}
\newcommand\GEWISpostcode{Postcode}
\newcommand\GEWIScity{Stad}
\newcommand\GEWISpostcodecity{\GEWISpostcode{}\ \GEWIScity{}}
\newcommand\GEWIScountry{} % \land is al een LaTeX command

% Variabeles for document details
\newcommand\GEWISyourreference{-}
\newcommand\GEWISmyreference{-}
\newcommand\GEWISdate{\today}
\newcommand\GEWISsubject{-}

% Goudglans variables
\newcommand\GEWISrecipient{}

% Other variabeles
\newcommand\GEWISdoctype{}

\newcommand{\printkenmerk}{\hfill
	\begin{minipage}[c][30mm][t]{31mm}
        \scriptsize
		{\bfseries \@GEWISyourreference}\\
		\ifthenelse{\equal{\GEWISyourreference}{}}{-}{\GEWISyourreference} \\[0.1\baselineskip]
		{\bfseries \@GEWISmyreference}\\
		\ifthenelse{\equal{\GEWISmyreference}{}}{-}{\GEWISmyreference} \\[0.1\baselineskip]
		{\bfseries \@GEWISsubject}\\
		\ifthenelse{\equal{\GEWISsubject}{}}{-}{\raggedright\GEWISsubject} \\[0.1\baselineskip]
		{\bfseries \@GEWISdate}\\
		\GEWISdate
	\end{minipage}
}

\newcommand{\printkenmerkhorizontal}{
	\begin{tabular}{@{}p{110mm}@{\hspace{9mm}}p{33mm}}
		{\bfseries \@GEWISdate} & {\bfseries \@GEWISyourreference}\\
		{\GEWISdate} & \ifthenelse{\equal{\GEWISyourreference}{}}{-}{\GEWISyourreference} \\\addlinespace[0.1cm]
		{\bfseries \@GEWISsubject} & {\bfseries \@GEWISmyreference} \\
		{\GEWISsubject} & \ifthenelse{\equal{\GEWISmyreference}{}}{-}{\GEWISmyreference}
	\end{tabular}
}

%% Starting new page numbering when entering new section
\newcounter{pagesec}
\def\totalsec{0}

% Get pagenumber of current section
\newcommand{\pagenumber}{%
  \stepcounter{pagesec}%
  \thepagesec\ / \ref{\totalsec}%
}

% Enter new section, restart page numbering
\newcommand{\resetpagecount}{%
  \clearpage
  \edef\@currentlabel{\thepagesec}\label{\totalsec}%
  \xdef\totalsec{\thepage}%
  \setcounter{pagesec}{0}}

% Make sure last pages get total section number
\AtEndDvi{\edef\@currentlabel{\thepagesec}\label{\totalsec}}

%% Pagestyle for first page, displaying contact details
\fancypagestyle{GEWISfirstpage}{
	\newgeometry{
		tmargin=47.5mm,
		hmargin={33mm, 27mm},
		headheight = 42.5mm,
		headsep = 5mm,
		height = 219.5mm,
		footskip = 17.5mm, %22mm,
		nomarginpar,
	}
    \fancyhf{}
    \renewcommand{\headrulewidth}{0pt}
    \lhead{
    	\color{GEWISDarkGray}
    	\begin{adjustwidth}{-5mm}{35mm}
    		\scriptsize
    		\begin{tabular}{@{}p{2.75mm} @{\hspace{2.45mm}}>{\raggedright\arraybackslash}p{35mm}}
                & {\bfseries \@GEWISsendername} \\
    			& {\bfseries\itshape \@GEWISsa} \\
    			& {\itshape \@GEWIStue} \\
    			& \\
    			& MF 3.155 \\
    			& De Groene Loper 5 \\
    			& 5612AZ Eindhoven \\
    			& The Netherlands
    		\end{tabular}\hspace{10mm}
	    	\begin{tabular}{@{}>{\raggedleft\arraybackslash}p{5mm} @{\hspace{4mm}}>{\raggedright\arraybackslash}p{35mm}}
	    		\multirow{2}{*}{\faicon{envelope}} & Postbus 513\\
	    		& 5600MB Eindhoven\\
	    		& \\\faicon{phone} & \@GEWISsenderphone\\\faicon{globe} & \href{https://\@GEWISsenderweb}{\@GEWISsenderweb}\\\faicon{at}
	    		& \href{mailto:\@GEWISsendermail}{\@GEWISsendermail}\\
	    		& \\\faicon{bank}
	    		& NL22ABNA0528195913\\
	    		{\tiny\bfseries KvK} & 40237787
	    	\end{tabular}
    	\end{adjustwidth}
	}
    \rfoot{
    	\begin{adjustwidth}{117mm}{}\hfill
    	\begin{minipage}[c]{32mm}\centering
    		\@GEWISpage \pagenumber
    	\end{minipage}
		\end{adjustwidth}
		\@AddBackground[]{1}
    }
}

%% Pagestyle for follower pages - no text, logo present
\fancypagestyle{GEWISfollowup}{
    \fancyhf{\restoregeometry{}}
    \renewcommand{\headrulewidth}{0pt}
    \lhead{}
    \cfoot{}
    \rfoot{
    	\begin{adjustwidth}{117mm}{}\hfill
			\begin{minipage}[c]{32mm}\centering
				\@GEWISpage \pagenumber
			\end{minipage}
		\end{adjustwidth}
		\@AddBackground[]{1}
	}
}

%% Pagestyle for small heading
\fancypagestyle{GEWISsmallheading}{
    \fancyhf{\restoregeometry{}}
    \renewcommand{\headrulewidth}{0pt}
    \lhead{}
    \cfoot{}
    \rfoot{
    	\begin{adjustwidth}{117mm}{}\hfill
			\begin{minipage}[c]{32mm}\centering
				\@GEWISpage \pagenumber
			\end{minipage}
		\end{adjustwidth}
		\@AddBackground[]{2}
	}
}

%% Complete settings for first page
\newcommand{\GEWISfirstpage}{
	\pagestyle{GEWISfollowup}
	\thispagestyle{GEWISfirstpage}
}

%% Switch to small heading
\newcommand{\GEWISsmallheading}{
	\pagestyle{GEWISsmallheading}
}

%% Switch to large heading
\newcommand{\GEWISlargeheading}{
	\pagestyle{GEWISfollowup}
}

\newcommand*{\@AddBackground}[2][]{
	\iftoggle{digital}
	{
		\iftoggle{printletterhead}%
			{%We include only the default letterhead and print it as well
				\@AddFullPageLayer[#2]{letterhead_alt}{ifvisible}{always}{B}{1}
			}
			{%We create one non-visible, but printable layer layer
				%\@AddFullPageLayer[#1]{letterhead_alt}{always}{never}{P}{0}
			 %We create one visible layer with the full style (on top of the previous one, since some viewers show both)
				\@AddFullPageLayer[#2]{letterhead_alt}{never}{always}{V}{1}
			}
	}{%We don't print anything at all
	}
}

%Arguments: [page number]{file name}{printocg}{exportocg}{LayerName}{visible}
\newcommand*{\@AddFullPageLayer}[6][] {
    \AddToShipoutPicture*{
        \put(-10.4mm\@gobble,-10.4mm\@gobble){%
            \begin{ocg}[printocg=#3,exportocg=#4,listintoolbar=iffirstuse]{Layer_briefpapier_#5}{#5}{#6}
                \parbox[b][\paperheight]{\paperwidth}{%
                    \vfill
                    \centering
                    \includegraphics[page=#1, keepaspectratio]{stationery/#2}
                    \vfill
                }
            \end{ocg}
        }
    }
}

%% Additional settings
\setlength\parindent{0pt}  % No indetation at new paragraph
\pagestyle{GEWISfollowup}  % General page style

\renewcommand{\labelitemi}{--}  % Changes the bullets of the itemize environments to dashes
%% Section styling
\renewcommand{\thesubsection}{\normalsize\arabic{subsection}}
\renewcommand{\thesubsubsection}{\normalfont\normalsize\arabic{subsection}.\arabic{subsubsection}}
\titleformat{\subsection}{\bfseries\large}{}{0em}{}
\titleformat{\subsubsection}{\normalfont}{\thesubsubsection}{1em}{}
\newcommand{\IBAN}{NL22 ABNA 0528~1959~13}
\hyphenation{GEWIS}

%% Public commands

% Set commands for document details
\newcommand\setYourreference[1]{\renewcommand\GEWISyourreference{#1}}
\newcommand\setMyreference[1]{\renewcommand\GEWISmyreference{#1}}
\newcommand\setDate[1]{\renewcommand\GEWISdate{#1}}
\newcommand\setSubject[1]{\renewcommand\GEWISsubject{#1}}

% Set commands for supplementary details
\newcommand\setType[1]{\renewcommand\GEWISdoctype{#1}}

% Set commands for contact details
\newcommand\setRecipient[1]{\renewcommand\GEWISRecipient{#1}}
\newcommand\setAttn[1]{\renewcommand\GEWISattn{\@GEWISattn\ #1}}
\newcommand\setStreet[1]{\renewcommand\GEWISstreet{#1}}
\newcommand\setPostcode[1]{
	\renewcommand{\GEWISpostcode}{#1}
	\renewcommand\GEWISpostcodecity{\GEWISpostcode{}\ \GEWIScity{}}
}
\newcommand\setCity[1]{
	\renewcommand\GEWIScity{#1}
	\renewcommand\GEWISpostcodecity{\GEWISpostcode{}\ \GEWIScity{}}
}
\newcommand\setPostcodecity[1]{
	\renewcommand\GEWISpostcodecity{#1}
	\renewcommand\GEWISpostcode{}
	\renewcommand\GEWIScity{}
}
\newcommand\setCountry[1]{\renewcommand\GEWIScountry{#1}}

%% Display address details
\newcommand\printadres{
	\begin{minipage}[c][30mm]{0.5\linewidth}
		\textbf{\large{\GEWISdoctype{}}}\\*
		\GEWISRecipient{}\\*
		\ifthenelse{\not\equal{\GEWISattn}{}}{\GEWISattn{}\\*}{}
		\GEWISstreet{}\\*
		\GEWISpostcodecity{}
		\ifthenelse{\not\equal{\GEWIScountry}{}}{\\*\GEWIScountry{}}{}
	\end{minipage}
}

\newcommand\printadresenkenmerk {
	\printadres
	\hfill
	\printkenmerk
	\vspace{1.25cm}	
}