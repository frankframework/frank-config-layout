<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" version="2.0">
	<xsl:param name="frankElements">
		<root xmlns:mermaid="mm:mermaid">
	<!--Receivers-->
	<nl.nn.adapterframework.http.rest.ApiListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>0</mermaid:modifier>
	</nl.nn.adapterframework.http.rest.ApiListener>
	<nl.nn.adapterframework.http.HttpListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>0</mermaid:modifier>
	</nl.nn.adapterframework.http.HttpListener>
	<nl.nn.adapterframework.http.RestListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>0</mermaid:modifier>
	</nl.nn.adapterframework.http.RestListener>
	<nl.nn.adapterframework.http.WebServiceListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>0</mermaid:modifier>
	</nl.nn.adapterframework.http.WebServiceListener>
	<nl.nn.adapterframework.extensions.cmis.CmisEventListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>0</mermaid:modifier>
	</nl.nn.adapterframework.extensions.cmis.CmisEventListener>

	<nl.nn.adapterframework.jms.PullingJmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.jms.PullingJmsListener>
	<nl.nn.adapterframework.extensions.esb.EsbJmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.esb.EsbJmsListener>
	<nl.nn.adapterframework.extensions.fxf.FxfListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.fxf.FxfListener>
	<nl.nn.adapterframework.extensions.ifsa.IfsaSimulatorJmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.ifsa.IfsaSimulatorJmsListener>
	<nl.nn.adapterframework.jms.JmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.jms.JmsListener>
	<nl.nn.adapterframework.jms.PushingJmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.jms.PushingJmsListener>
	<nl.nn.adapterframework.extensions.tibco.TibcoListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.tibco.TibcoListener>
	<nl.nn.adapterframework.extensions.tibco.TibcoLogJmsListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.tibco.TibcoLogJmsListener>
	<nl.nn.adapterframework.extensions.ifsa.IfsaProviderListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.ifsa.IfsaProviderListener>
	<nl.nn.adapterframework.extensions.ifsa.jms.PullingIfsaProviderListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.ifsa.jms.PullingIfsaProviderListener>
	<nl.nn.adapterframework.extensions.ifsa.jms.PushingIfsaProviderListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.ifsa.jms.PushingIfsaProviderListener>
	<nl.nn.adapterframework.extensions.mqtt.MqttListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>1</mermaid:modifier>
	</nl.nn.adapterframework.extensions.mqtt.MqttListener>

	<nl.nn.adapterframework.jdbc.JdbcListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>2</mermaid:modifier>
	</nl.nn.adapterframework.jdbc.JdbcListener>
	<nl.nn.adapterframework.jdbc.JdbcTableListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>2</mermaid:modifier>
	</nl.nn.adapterframework.jdbc.JdbcTableListener>
	<nl.nn.adapterframework.jdbc.MessageStoreListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>2</mermaid:modifier>
	</nl.nn.adapterframework.jdbc.MessageStoreListener>
	<nl.nn.adapterframework.jdbc.SimpleJdbcListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>2</mermaid:modifier>
	</nl.nn.adapterframework.jdbc.SimpleJdbcListener>

	<nl.nn.adapterframework.receivers.DirectoryListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>3</mermaid:modifier>
	</nl.nn.adapterframework.receivers.DirectoryListener>
	<nl.nn.adapterframework.receivers.ExchangeMailListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>3</mermaid:modifier>
	</nl.nn.adapterframework.receivers.ExchangeMailListener>
	<nl.nn.adapterframework.receivers.ImapListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>3</mermaid:modifier>
	</nl.nn.adapterframework.receivers.ImapListener>
	<nl.nn.adapterframework.receivers.Samba2Listener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>3</mermaid:modifier>
	</nl.nn.adapterframework.receivers.Samba2Listener>
	<nl.nn.adapterframework.receivers.SambaListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>3</mermaid:modifier>
	</nl.nn.adapterframework.receivers.SambaListener>

	<nl.nn.adapterframework.receivers.JavaListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>4</mermaid:modifier>
	</nl.nn.adapterframework.receivers.JavaListener>

	<nl.nn.adapterframework.extensions.sap.SapListener>
		<mermaid:type>listener</mermaid:type>
		<mermaid:modifier>5</mermaid:modifier>
	</nl.nn.adapterframework.extensions.sap.SapListener>





	<!--Pipes, validators and wrappers-->
	<!--Endpoints-->
	<nl.nn.adapterframework.pipes.CleanupOldFilesPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.CleanupOldFilesPipe>
	<nl.nn.adapterframework.extensions.coolgen.CoolGenWrapperPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.extensions.coolgen.CoolGenWrapperPipe>
	<nl.nn.adapterframework.pipes.CredentialCheckingPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.CredentialCheckingPipe>
	<nl.nn.adapterframework.filesystem.FileSystemPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.filesystem.FileSystemPipe>
	<nl.nn.adapterframework.extensions.tibco.GetTibcoQueues><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.extensions.tibco.GetTibcoQueues>
	<nl.nn.ibistesttool.LadybugPipe><mermaid:type>endpoint</mermaid:type></nl.nn.ibistesttool.LadybugPipe>
	<nl.nn.adapterframework.pipes.LarvaPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.LarvaPipe>
	<nl.nn.adapterframework.ldap.LdapFindGroupMembershipsPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.ldap.LdapFindGroupMembershipsPipe>
	<nl.nn.adapterframework.ldap.LdapFindMemberPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.ldap.LdapFindMemberPipe>
	<nl.nn.adapterframework.pipes.FilePipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.FilePipe>
	<nl.nn.adapterframework.pipes.LocalFileSystemPipe>
		<mermaid:type>endpoint</mermaid:type>
		<mermaid:attribute name="action"/>
	</nl.nn.adapterframework.pipes.LocalFileSystemPipe>
	<nl.nn.adapterframework.pipes.MailSenderPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.MailSenderPipe>
	<nl.nn.adapterframework.extensions.rekenbox.RekenBoxCaller><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.extensions.rekenbox.RekenBoxCaller>
	<nl.nn.adapterframework.pipes.Samba1Pipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.Samba1Pipe>
	<nl.nn.adapterframework.pipes.Samba2Pipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.Samba2Pipe>
	<nl.nn.adapterframework.extensions.svn.ScanTibcoSolutionPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.extensions.svn.ScanTibcoSolutionPipe>
	<nl.nn.adapterframework.extensions.tibco.SendTibcoMessage><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.extensions.tibco.SendTibcoMessage>
	<nl.nn.adapterframework.pipes.SenderPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.SenderPipe>
	<nl.nn.adapterframework.pipes.GenericMessageSendingPipe><mermaid:type>endpoint</mermaid:type></nl.nn.adapterframework.pipes.GenericMessageSendingPipe>

	<!--Validator-->
	<nl.nn.adapterframework.extensions.api.ApiWsdlXmlValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="schema"/>
		<mermaid:attribute name="schemaLocation"/>
		<mermaid:attribute name="wsdl"/>
	</nl.nn.adapterframework.extensions.api.ApiWsdlXmlValidator>
	<nl.nn.adapterframework.extensions.esb.EsbSoapValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="schema"/>
		<mermaid:attribute name="schemaLocation"/>
		<mermaid:attribute name="wsdl"/>
	</nl.nn.adapterframework.extensions.esb.EsbSoapValidator>
	<nl.nn.adapterframework.extensions.fxf.FxfXmlValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="direction"/>
		<mermaid:attribute name="wsdl"/>
	</nl.nn.adapterframework.extensions.fxf.FxfXmlValidator>
	<nl.nn.adapterframework.pipes.Json2XmlValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="outputFormat"/>
		<mermaid:attribute name="responseRoot"/>
	</nl.nn.adapterframework.pipes.Json2XmlValidator>
	<nl.nn.adapterframework.pipes.JsonWellFormedChecker><mermaid:type>validator</mermaid:type></nl.nn.adapterframework.pipes.JsonWellFormedChecker>
	<nl.nn.adapterframework.soap.SoapValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="schema"/>
		<mermaid:attribute name="schemaLocation"/>
	</nl.nn.adapterframework.soap.SoapValidator>
	<nl.nn.adapterframework.pipes.WsdlXmlValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="schema"/>
		<mermaid:attribute name="schemaLocation"/>
		<mermaid:attribute name="wsdl"/>
	</nl.nn.adapterframework.pipes.WsdlXmlValidator>
	<nl.nn.adapterframework.pipes.XmlValidator>
		<mermaid:type>validator</mermaid:type>
		<mermaid:attribute name="schema"/>
		<mermaid:attribute name="schemaLocation"/>
	</nl.nn.adapterframework.pipes.XmlValidator>
	<nl.nn.adapterframework.pipes.XmlWellFormedChecker><mermaid:type>validator</mermaid:type></nl.nn.adapterframework.pipes.XmlWellFormedChecker>

	<!--wrapper-->
	<nl.nn.adapterframework.extensions.api.ApiSoapWrapperPipe>
		<mermaid:type>wrapper</mermaid:type>
		<mermaid:attribute name="direction"/>
	</nl.nn.adapterframework.extensions.api.ApiSoapWrapperPipe>
	<nl.nn.adapterframework.extensions.esb.DirectWrapperPipe><mermaid:type>wrapper</mermaid:type></nl.nn.adapterframework.extensions.esb.DirectWrapperPipe>
	<nl.nn.adapterframework.extensions.esb.EsbSoapWrapperPipe>
		<mermaid:type>wrapper</mermaid:type>
		<mermaid:attribute name="direction"/>
	</nl.nn.adapterframework.extensions.esb.EsbSoapWrapperPipe>
	<nl.nn.adapterframework.extensions.fxf.FxfWrapperPipe>
		<mermaid:type>wrapper</mermaid:type>
		<mermaid:attribute name="direction"/>
	</nl.nn.adapterframework.extensions.fxf.FxfWrapperPipe>
	<nl.nn.adapterframework.soap.SoapWrapperPipe>
		<mermaid:type>wrapper</mermaid:type>
		<mermaid:attribute name="direction"/>
	</nl.nn.adapterframework.soap.SoapWrapperPipe>

	<!--Translator-->
	<nl.nn.adapterframework.extensions.rekenbox.Adios2XmlPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.extensions.rekenbox.Adios2XmlPipe>
	<nl.nn.adapterframework.extensions.aspose.pipe.AmountOfPagesPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.extensions.aspose.pipe.AmountOfPagesPipe>
	<nl.nn.adapterframework.extensions.api.ApiStreamPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.extensions.api.ApiStreamPipe>
	<nl.nn.adapterframework.pipes.Base64Pipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.Base64Pipe>
	<nl.nn.adapterframework.jdbc.BatchBlobTransformerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.jdbc.BatchBlobTransformerPipe>
	<nl.nn.adapterframework.jdbc.BatchClobTransformerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.jdbc.BatchClobTransformerPipe>
	<nl.nn.adapterframework.batch.BatchFileTransformerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.batch.BatchFileTransformerPipe>
	<nl.nn.adapterframework.pipes.BytesOutputPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.BytesOutputPipe>
	<nl.nn.adapterframework.pipes.ChecksumPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.ChecksumPipe>
	<nl.nn.adapterframework.pipes.CompressPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.CompressPipe>
	<nl.nn.adapterframework.pipes.CrlPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.CrlPipe>
	<nl.nn.adapterframework.pipes.CsvParserPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.CsvParserPipe>
	<nl.nn.adapterframework.pipes.DomainTransformerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.DomainTransformerPipe>
	<nl.nn.adapterframework.pipes.EchoPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.EchoPipe>
	<nl.nn.adapterframework.pipes.EscapePipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.EscapePipe>
	<nl.nn.adapterframework.pipes.FixedResultPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.FixedResultPipe>
	<nl.nn.adapterframework.pipes.HashPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.HashPipe>
	<nl.nn.adapterframework.pipes.JsonPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.JsonPipe>
	<nl.nn.adapterframework.pipes.JsonXsltPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.JsonXsltPipe>
	<nl.nn.adapterframework.extensions.rekenbox.LabelFormat><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.extensions.rekenbox.LabelFormat>
	<nl.nn.adapterframework.pipes.PGPPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.PGPPipe>
	<nl.nn.adapterframework.pipes.PasswordGeneratorPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.PasswordGeneratorPipe>
	<nl.nn.adapterframework.pipes.PasswordHashPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.PasswordHashPipe>
	<nl.nn.adapterframework.extensions.aspose.pipe.PdfPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.extensions.aspose.pipe.PdfPipe>
	<nl.nn.adapterframework.pipes.ReplacerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.ReplacerPipe>
	<nl.nn.adapterframework.pipes.SignaturePipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.SignaturePipe>
	<nl.nn.adapterframework.pipes.SizePipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.SizePipe>
	<nl.nn.adapterframework.pipes.SkipPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.SkipPipe>
	<nl.nn.adapterframework.batch.StreamTransformerPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.batch.StreamTransformerPipe>
	<nl.nn.adapterframework.pipes.Text2XmlPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.Text2XmlPipe>
	<nl.nn.adapterframework.pipes.TextSplitterPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.TextSplitterPipe>
	<nl.nn.adapterframework.pipes.UUIDGeneratorPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.UUIDGeneratorPipe>
	<nl.nn.adapterframework.pipes.UnzipPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.UnzipPipe>
	<nl.nn.adapterframework.pipes.WsdlGeneratorPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.WsdlGeneratorPipe>
	<nl.nn.adapterframework.pipes.XQueryPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.XQueryPipe>
	<nl.nn.adapterframework.pipes.XmlBuilderPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.pipes.XmlBuilderPipe>
	<nl.nn.adapterframework.pipes.XsltPipe>
		<mermaid:type>translator</mermaid:type>
		<mermaid:attribute name="styleSheetNameSessionKey" text="xsl name sessionKey: "/>
		<mermaid:attribute name="xpathExpression"/>
		<mermaid:attribute name="styleSheetName"/>
	</nl.nn.adapterframework.pipes.XsltPipe>
	<nl.nn.adapterframework.compression.ZipWriterPipe><mermaid:type>translator</mermaid:type></nl.nn.adapterframework.compression.ZipWriterPipe>

	<!--Splitter-->
	<nl.nn.adapterframework.jdbc.BlobLineIteratingPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.jdbc.BlobLineIteratingPipe>
	<nl.nn.adapterframework.jdbc.ClobLineIteratingPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.jdbc.ClobLineIteratingPipe>
	<nl.nn.adapterframework.filesystem.ForEachAttachmentPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.filesystem.ForEachAttachmentPipe>
	<nl.nn.adapterframework.pipes.ForEachChildElementPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.pipes.ForEachChildElementPipe>
	<nl.nn.adapterframework.jdbc.ResultSetIteratingPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.jdbc.ResultSetIteratingPipe>
	<nl.nn.adapterframework.pipes.StreamLineIteratorPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.pipes.StreamLineIteratorPipe>
	<nl.nn.adapterframework.pipes.StringIteratorPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.pipes.StringIteratorPipe>
	<nl.nn.adapterframework.compression.ZipIteratorPipe><mermaid:type>splitter</mermaid:type></nl.nn.adapterframework.compression.ZipIteratorPipe>

	<!--Router-->
	<nl.nn.adapterframework.pipes.CompareIntegerPipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.CompareIntegerPipe>
	<nl.nn.adapterframework.pipes.CompareStringPipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.CompareStringPipe>
	<nl.nn.adapterframework.pipes.CounterSwitchPipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.CounterSwitchPipe>
	<nl.nn.adapterframework.pipes.DelayPipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.DelayPipe>
	<nl.nn.adapterframework.pipes.IfMultipart><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.IfMultipart>
	<nl.nn.adapterframework.pipes.IsUserInRolePipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.IsUserInRolePipe>
	<nl.nn.adapterframework.pipes.IsXmlIfPipe><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.IsXmlIfPipe>
	<nl.nn.adapterframework.pipes.XmlIf><mermaid:type>router</mermaid:type></nl.nn.adapterframework.pipes.XmlIf>
	<nl.nn.adapterframework.pipes.XmlSwitch>
		<mermaid:type>router</mermaid:type>
		<mermaid:attribute name="xpathExpression"/>
		<mermaid:attribute name="styleSheetName"/>
	</nl.nn.adapterframework.pipes.XmlSwitch>

	<!--Session-->
	<nl.nn.adapterframework.http.rest.ApiPrincipalPipe><mermaid:type>session</mermaid:type></nl.nn.adapterframework.http.rest.ApiPrincipalPipe>
	<nl.nn.adapterframework.pipes.EtagHandlerPipe><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.EtagHandlerPipe>
	<nl.nn.adapterframework.pipes.GetFromSession><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.GetFromSession>
	<nl.nn.adapterframework.pipes.GetLtpaTokenPipe><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.GetLtpaTokenPipe>
	<nl.nn.adapterframework.pipes.GetPrincipalPipe><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.GetPrincipalPipe>
	<nl.nn.adapterframework.pipes.IncreaseIntegerPipe><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.IncreaseIntegerPipe>
	<nl.nn.adapterframework.pipes.PutInSession><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.PutInSession>
	<nl.nn.adapterframework.pipes.PutParametersInSession><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.PutParametersInSession>
	<nl.nn.adapterframework.pipes.PutSystemDateInSession><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.PutSystemDateInSession>
	<nl.nn.adapterframework.pipes.RemoveFromSession><mermaid:type>session</mermaid:type></nl.nn.adapterframework.pipes.RemoveFromSession>

	<!--ErrorHandling-->
	<nl.nn.adapterframework.pipes.ExceptionPipe><mermaid:type>errorhandling</mermaid:type></nl.nn.adapterframework.pipes.ExceptionPipe>





	<!--Senders-->
	<!--HTTP-->
	<nl.nn.adapterframework.http.HttpSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>0</mermaid:modifier></nl.nn.adapterframework.http.HttpSender>
	<nl.nn.adapterframework.http.MultipartHttpSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>0</mermaid:modifier></nl.nn.adapterframework.http.MultipartHttpSender>
	<nl.nn.adapterframework.http.WebServiceNtlmSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>0</mermaid:modifier></nl.nn.adapterframework.http.WebServiceNtlmSender>
	<nl.nn.adapterframework.http.WebServiceSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>0</mermaid:modifier></nl.nn.adapterframework.http.WebServiceSender>
	<nl.nn.adapterframework.extensions.akamai.NetStorageSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>0</mermaid:modifier></nl.nn.adapterframework.extensions.akamai.NetStorageSender>

	<!--JMS-->
	<nl.nn.adapterframework.jms.JmsSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.jms.JmsSender>
	<nl.nn.adapterframework.extensions.esb.EsbJmsSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.esb.EsbJmsSender>
	<nl.nn.adapterframework.extensions.ifsa.IfsaRequesterSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.ifsa.IfsaRequesterSender>
	<nl.nn.adapterframework.extensions.ifsa.IfsaSimulatorJmsSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.ifsa.IfsaSimulatorJmsSender>
	<nl.nn.adapterframework.extensions.ibm.IMSSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.ibm.IMSSender>
	<nl.nn.adapterframework.extensions.ibm.MQSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.ibm.MQSender>
	<nl.nn.adapterframework.extensions.tibco.TibcoSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.tibco.TibcoSender>
	<nl.nn.adapterframework.extensions.mqtt.MqttSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>1</mermaid:modifier></nl.nn.adapterframework.extensions.mqtt.MqttSender>

	<!--JDBC-->
	<nl.nn.adapterframework.jdbc.FixedQuerySender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jdbc.FixedQuerySender>
	<nl.nn.adapterframework.jdbc.DirectQuerySender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jdbc.DirectQuerySender>
	<nl.nn.adapterframework.jdbc.XmlQuerySender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jdbc.XmlQuerySender>
	<nl.nn.adapterframework.jdbc.MessageStoreSender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jdbc.MessageStoreSender>
	<nl.nn.adapterframework.jdbc.ResultSet2FileSender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jdbc.ResultSet2FileSender>
	<nl.nn.adapterframework.jms.XmlJmsBrowserSender><mermaid:type>database</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.jms.XmlJmsBrowserSender>

	<!--Filesystem-->
	<nl.nn.adapterframework.senders.AmazonS3Sender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.AmazonS3Sender>
	<nl.nn.adapterframework.filesystem.FileSystemSenderWithAttachments><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.filesystem.FileSystemSenderWithAttachments>
	<nl.nn.adapterframework.senders.ExchangeFolderSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.ExchangeFolderSender>
	<nl.nn.adapterframework.senders.FtpFileSystemSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.FtpFileSystemSender>
	<nl.nn.adapterframework.senders.LocalFileSystemSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.LocalFileSystemSender>
	<nl.nn.adapterframework.senders.SambaSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.SambaSender>
	<nl.nn.adapterframework.senders.Samba1Sender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.Samba1Sender>
	<nl.nn.adapterframework.senders.Samba2Sender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>3</mermaid:modifier></nl.nn.adapterframework.senders.Samba2Sender>

	<!--Frank -->
	<nl.nn.adapterframework.senders.IbisJavaSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>4</mermaid:modifier></nl.nn.adapterframework.senders.IbisJavaSender>
	<nl.nn.adapterframework.senders.IbisLocalSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>4</mermaid:modifier></nl.nn.adapterframework.senders.IbisLocalSender>
	<nl.nn.adapterframework.http.IbisWebServiceSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>4</mermaid:modifier></nl.nn.adapterframework.http.IbisWebServiceSender>

	<!--SAP-->
	<nl.nn.adapterframework.extensions.sap.IdocSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>5</mermaid:modifier></nl.nn.adapterframework.extensions.sap.IdocSender>
	<nl.nn.adapterframework.extensions.sap.SapSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>5</mermaid:modifier></nl.nn.adapterframework.extensions.sap.SapSender>

	<!--Mail-->
	<nl.nn.adapterframework.senders.MailSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>6</mermaid:modifier></nl.nn.adapterframework.senders.MailSender>
	<nl.nn.adapterframework.senders.SendGridSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>6</mermaid:modifier></nl.nn.adapterframework.senders.SendGridSender>
	<nl.nn.adapterframework.senders.ImapSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>6</mermaid:modifier></nl.nn.adapterframework.senders.ImapSender>

	<!--Frank utility-->
	<nl.nn.adapterframework.senders.CommandSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.CommandSender>
	<nl.nn.adapterframework.senders.DelaySender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.DelaySender>
	<nl.nn.adapterframework.senders.EchoSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.EchoSender>
	<nl.nn.adapterframework.senders.FixedResultSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.FixedResultSender>
	<nl.nn.adapterframework.senders.JavascriptSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.JavascriptSender>
	<nl.nn.adapterframework.senders.JsonXsltSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.JsonXsltSender>
	<nl.nn.adapterframework.senders.LogSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.LogSender>
	<nl.nn.adapterframework.senders.ParallelSenders><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.ParallelSenders>
	<nl.nn.adapterframework.senders.ReloadSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.ReloadSender>
	<nl.nn.adapterframework.scheduler.SchedulerSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.scheduler.SchedulerSender>
	<nl.nn.adapterframework.senders.SenderSeries><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.SenderSeries>
	<nl.nn.adapterframework.senders.SenderWrapper><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.SenderWrapper>
	<nl.nn.adapterframework.senders.ShadowSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.ShadowSender>
	<nl.nn.adapterframework.senders.XmlValidatorSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.XmlValidatorSender>
	<nl.nn.adapterframework.senders.XsltSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>7</mermaid:modifier></nl.nn.adapterframework.senders.XsltSender>
	<nl.nn.adapterframework.compression.ZipWriterSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>2</mermaid:modifier></nl.nn.adapterframework.compression.ZipWriterSender>

	<!--other-->
	<nl.nn.adapterframework.extensions.cmis.CmisSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.extensions.cmis.CmisSender>
	<nl.nn.adapterframework.extensions.idin.IdinSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.extensions.idin.IdinSender>
	<nl.nn.adapterframework.ldap.LdapSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.ldap.LdapSender>
	<nl.nn.adapterframework.mongodb.MongoDbSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.mongodb.MongoDbSender>
	<nl.nn.adapterframework.xcom.XComSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.xcom.XComSender>
	<nl.nn.adapterframework.extensions.xfb.XfbSender><mermaid:type>endpoint</mermaid:type><mermaid:modifier>8</mermaid:modifier></nl.nn.adapterframework.extensions.xfb.XfbSender>





	<!--styling by element name-->
	<exit><mermaid:type>endpoint</mermaid:type></exit>
	<receiver><mermaid:type>endpoint</mermaid:type></receiver>
	<listener><mermaid:type>endpoint</mermaid:type></listener>
</root>
	</xsl:param>

	<xsl:output method="text" indent="yes" omit-xml-declaration="yes"/>

	<xsl:variable name="adapterCount" select="count(//adapter)"/>
	<xsl:variable name="errorForwards" select="('exception','failure','fail','timeout','illegalResult','presumedTimeout','interrupt','parserError','outputParserError','outputFailure')"/>

	<xsl:template match="/">
		<!-- Create the Mermaid graph in 2 steps
			- First preprocess adapters, putting pipes in the correct order, explicitly adding implicit forwards and preprocess input and output validators and wrappers
			- Then convert the adapter to mermaid code-->
		<xsl:variable name="adapterWithExits">
			<xsl:apply-templates select="*" mode="resolveExits"/>
		</xsl:variable>

		<xsl:variable name="preproccessedAdapter">
			<xsl:apply-templates select="$adapterWithExits/adapter" mode="preprocess"/>
		</xsl:variable>
		<xsl:variable name="forwards" select="$preproccessedAdapter//forward"/>

		<xsl:text>flowchart&#10;</xsl:text>
		<xsl:apply-templates select="$preproccessedAdapter" mode="convertElements"/>
		<xsl:text>	classDef normal fill:#fff,stroke-width:4px,stroke:#8bc34a;&#10;</xsl:text>
		<xsl:text>	classDef errorOutline fill:#fff,stroke-width:4px,stroke:#ec4758;&#10;</xsl:text>
		<xsl:apply-templates select="$forwards" mode="convertForwards"/>
		<xsl:variable name="forwardNums">
			<xsl:for-each select="$forwards">
				<xsl:element name="forward">
					<xsl:copy-of select="@errorHandling"/>
					<xsl:attribute name="pos" select="position() - 1"/>
				</xsl:element>
			</xsl:for-each>
		</xsl:variable>
		<xsl:for-each-group select="$forwardNums/forward" group-by="@errorHandling">
			<xsl:text>	linkStyle </xsl:text>
			<xsl:value-of select="current-group()/@pos" separator=","/>
			<xsl:choose>
				<xsl:when test="xs:boolean(current-grouping-key())">
					<xsl:text> stroke:#ec4758,stroke-width:3px,fill:none;</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text> stroke:#8bc34a,stroke-width:3px,fill:none;</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:text>&#10;</xsl:text>
		</xsl:for-each-group>
		<!-- The code below gives back the preprocessed configuration
				This is for testing purposes. To test, also change method(line 3) to xml instead of text-->
<!--		 <xsl:copy-of select="$preproccessedAdapter"/>-->
	</xsl:template>

	<xsl:template match="*" mode="resolveExits">
		<xsl:copy>
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="*" mode="#current"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="pipeline" mode="resolveExits">
		<xsl:copy>
			<xsl:copy-of select="@*"/>
			<exits>
				<xsl:variable name="definedUsedExits" select="//exit[(@name = current()//forward/@path) or (@path = current()//forward/@path)]"/>
				<xsl:apply-templates select="$definedUsedExits" mode="#current"/>
				<xsl:if test="not($definedUsedExits)">
					<exit name="READY" state="success"/>
				</xsl:if>
			</exits>
			<xsl:copy-of select="*[not(name() = ('exit','exits'))]"/>
		</xsl:copy>
	</xsl:template>

	<!--Copy exit but replace path with name attribute-->
	<xsl:template match="exit" mode="resolveExits">
		<xsl:element name="exit">
			<xsl:attribute name="name" select="(@name,@path)[1]"/>
			<xsl:copy-of select="@*[not(name() = ('path', 'name'))]"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="*" mode="preprocess">
		<xsl:copy>
			<xsl:call-template name="defaultCopyActions"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="attribute" mode="preprocess"></xsl:template>
	<xsl:template match="sender" mode="preprocess"></xsl:template>

	<xsl:template match="@*|comment()" mode="preprocess">
		<xsl:copy/>
	</xsl:template>

	<xsl:template match="adapter" mode="preprocess">
		<xsl:copy>
			<xsl:attribute name="elementID" select="generate-id()"/>
			<xsl:apply-templates select="@*" mode="#current"/>
			<xsl:variable name="firstElementID">
				<xsl:choose>
					<xsl:when test="exists(pipeline/inputValidator)">
						<xsl:value-of select="generate-id(pipeline/inputValidator)"/>
					</xsl:when>
					<xsl:when test="exists(pipeline/inputWrapper)">
						<xsl:value-of select="generate-id(pipeline/inputWrapper)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="generate-id((pipeline/pipe[@name=current()/pipeline/@firstPipe],pipeline/pipe[1])[1])"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:apply-templates select="receiver" mode="preprocess">
				<xsl:with-param name="targetID" select="$firstElementID"/>
			</xsl:apply-templates>
			<xsl:apply-templates select="pipeline" mode="preprocess">
				<xsl:with-param name="firstElementID" select="$firstElementID"/>
			</xsl:apply-templates>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="receiver" mode="preprocess">
		<xsl:param name="targetID"/>
		<xsl:copy>
			<xsl:attribute name="targetID" select="$targetID"/>
			<xsl:call-template name="defaultCopyActions"/>
			<xsl:element name="forward">
				<xsl:attribute name="name" select="'success'"/>
				<xsl:attribute name="path" select="$targetID"/>
				<xsl:attribute name="targetID" select="$targetID"/>
				<xsl:attribute name="errorHandling" select="'false'"/>
			</xsl:element>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="pipeline" mode="preprocess">
		<xsl:param name="firstElementID"/>
		<!-- Modify the pipeline in the following ways:
			- Create all exits that are used by the pipeline
			- Add a unique ID on all elements, and add that ID to the forwards pointing to that element
			- Add implicit forwards and global-forwards explicitly to inputValidator -and Wrapper and all pipes
			- For each exit that is used by the pipeline, make an outputWrapper -and Validator if they originally existed
			- Recursively go through pipeline to determine things like errorHandling.
		-->
		<xsl:copy>
			<xsl:apply-templates select="@*" mode="#current"/>
			<xsl:variable name="firstPipe" select="(pipe[@name=current()/@firstPipe],pipe[1])[1]"/>

			<xsl:variable name="elementsWithExplicitForwards">
				<xsl:apply-templates select="inputValidator" mode="#current">
					<xsl:with-param name="firstPipe" select="$firstPipe"/>
				</xsl:apply-templates>

				<xsl:apply-templates select="inputWrapper" mode="#current">
					<xsl:with-param name="firstPipe" select="$firstPipe"/>
				</xsl:apply-templates>

				<xsl:apply-templates select="pipe" mode="#current"/>
			</xsl:variable>

			<xsl:variable name="pipelineWithExplicitForwards">
				<xsl:copy-of select="$elementsWithExplicitForwards/*"/>
				<!-- Create outputwrappers and outputvalidators per exit -->
				<xsl:for-each select=".//exit[@name = $elementsWithExplicitForwards//forward/@path]">
					<xsl:apply-templates select="ancestor::pipeline/outputWrapper" mode="#current">
						<xsl:with-param name="exit" select="."/>
					</xsl:apply-templates>
					<xsl:variable name="exit" select="."/>
					<xsl:for-each select="ancestor::pipeline/(outputValidator,inputValidator[@responseRoot])[1]">
						<xsl:call-template name="preprocessOutputValidator">
							<xsl:with-param name="exit" select="$exit"/>
						</xsl:call-template>
					</xsl:for-each>
				</xsl:for-each>
			</xsl:variable>

			<xsl:apply-templates select="$pipelineWithExplicitForwards/*[@elementID=$firstElementID]" mode="sort">
				<xsl:with-param name="originalPipes">
					<xsl:copy-of select="$pipelineWithExplicitForwards/*"/>
					<xsl:apply-templates select=".//exit" mode="#current"/>
				</xsl:with-param>
			</xsl:apply-templates>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="pipeline/inputValidator" mode="preprocess">
		<xsl:param name="firstPipe"/>

		<xsl:copy>
			<xsl:call-template name="defaultPipeCopyActions"/>
			<!-- Add success forward -->
			<xsl:call-template name="createForward">
				<xsl:with-param name="name" select="'success'"/>
				<xsl:with-param name="path" select="$firstPipe/@name"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="pipeline/inputWrapper" mode="preprocess">
		<xsl:param name="firstPipe"/>

		<xsl:copy>
			<xsl:call-template name="defaultCopyActions"/>
			<!-- Add success forward -->
			<xsl:call-template name="createForward">
				<xsl:with-param name="name" select="'success'"/>
				<xsl:with-param name="path" select="$firstPipe/@name"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="pipeline/outputWrapper" mode="preprocess">
		<xsl:param name="exit"/>

		<xsl:copy>
			<xsl:attribute name="elementID" select="concat(generate-id(), '-', $exit/@name)"/>
			<xsl:attribute name="name" select="'OutputWrapper'"/>
			<xsl:apply-templates select="@*|*" mode="#current"/>
			<xsl:call-template name="styleElement"/>
			<!-- Add success forward -->
			<xsl:call-template name="createForward">
				<xsl:with-param name="name" select="'success'"/>
				<xsl:with-param name="path" select="$exit/@name"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<xsl:template name="preprocessOutputValidator">
		<xsl:param name="exit"/>

		<xsl:element name="outputValidator">
			<xsl:attribute name="elementID" select="concat(generate-id(), '-', $exit/@name)"/>
			<xsl:apply-templates select="@*|*[name() != 'forward']" mode="#current"/>
			<xsl:call-template name="styleElement"/>
			<xsl:apply-templates select="forward|../global-forwards/forward[not(@name = current()/forward/@name)]" mode="#current">
				<xsl:with-param name="parentName" select="'outputValidator'"/>
			</xsl:apply-templates>
			<!-- Add success forward -->
			<xsl:element name="forward">
				<xsl:attribute name="name" select="'success'"/>
				<xsl:attribute name="customText" select="$exit/@name" />
				<xsl:attribute name="path" select="$exit/@name" />
				<xsl:attribute name="targetID" select="generate-id($exit)"/>
			</xsl:element>
		</xsl:element>
	</xsl:template>

	<xsl:template match="pipe" mode="preprocess">
		<xsl:copy>
			<xsl:call-template name="defaultPipeCopyActions"/>

			<xsl:for-each select="descendant::sender[@className='nl.nn.adapterframework.senders.IbisLocalSender']">
				<xsl:call-template name="IbisLocalSender"/>
			</xsl:for-each>
			<!-- Add success forward if not present -->
			<xsl:call-template name="createForwardIfNecessary">
				<xsl:with-param name="forwards" select="forward"/>
				<xsl:with-param name="name" select="'success'"/>
				<xsl:with-param name="path" select="(following-sibling::pipe/@name,..//exit[@state='success']/@name,'READY')[1]"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<!-- The following pipes do not have a success forward, so it should not be added by default -->
	<xsl:template match="pipe[@className=('nl.nn.adapterframework.pipes.CompareStringPipe',
										 'nl.nn.adapterframework.pipes.CompareIntegerPipe')]" mode="preprocess">
		<xsl:copy>
			<xsl:call-template name="defaultPipeCopyActions"/>
		</xsl:copy>
	</xsl:template>

	<!-- The XmlIf can have different forward names which then might directly point to a next pipe/exit -->
	<xsl:template match="pipe[@className='nl.nn.adapterframework.pipes.XmlIf']" mode="preprocess">
		<xsl:copy>
			<xsl:call-template name="switchPipeCopyActions"/>

			<xsl:variable name="thenForwardName" select="if (exists(@thenForwardName)) then (@thenForwardName) else ('then')"/>
			<xsl:variable name="elseForwardName" select="if (exists(@elseForwardName)) then (@elseForwardName) else ('else')"/>
			<xsl:variable name="forwardNames" select="($thenForwardName,$elseForwardName)"/>
			<xsl:variable name="forwards">
				<xsl:apply-templates select="forward[@name = $forwardNames]" mode="#current"/>
				<xsl:apply-templates select="../global-forwards/forward[not(@name = current()/forward/@name) and @name = $forwardNames]" mode="#current"/>
			</xsl:variable>

			<xsl:copy-of select="$forwards"/>

			<xsl:call-template name="createForwardIfNecessary">
				<xsl:with-param name="forwards" select="$forwards/forward"/>
				<xsl:with-param name="name" select="'then'"/>
				<xsl:with-param name="path" select="$thenForwardName"/>
			</xsl:call-template>
			<xsl:call-template name="createForwardIfNecessary">
				<xsl:with-param name="forwards" select="$forwards/forward"/>
				<xsl:with-param name="name" select="'else'"/>
				<xsl:with-param name="path" select="$elseForwardName"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<!-- The XmlSwitchPipe can have no forwards, in that case do nothing. Users shouldn't let this happen -->
	<xsl:template match="pipe[@className='nl.nn.adapterframework.pipes.XmlSwitch']" mode="preprocess">
		<xsl:copy>
			<xsl:call-template name="switchPipeCopyActions"/>

			<xsl:variable name="forwards">
				<xsl:apply-templates select="forward" mode="#current"/>
				<xsl:apply-templates select="../global-forwards/forward[not(@name = current()/forward/@name)]" mode="#current"/>
			</xsl:variable>

			<xsl:copy-of select="$forwards"/>

			<xsl:call-template name="createForwardIfNecessary">
				<xsl:with-param name="forwards" select="$forwards/forward"/>
				<xsl:with-param name="name" select="'notFoundForwardName'"/>
				<xsl:with-param name="path" select="@notFoundForwardName"/>
			</xsl:call-template>
			<xsl:call-template name="createForwardIfNecessary">
				<xsl:with-param name="forwards" select="$forwards/forward"/>
				<xsl:with-param name="name" select="'emptyForwardName'"/>
				<xsl:with-param name="path" select="@emptyForwardName"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:template>

	<!-- For local senders, add a 'forward' to the sub-adapter -->
	<xsl:template name="IbisLocalSender">
		<xsl:copy>
			<xsl:call-template name="defaultCopyActions"/>
		</xsl:copy>

		<xsl:variable name="targetReceiver" select="ancestor::*/adapter/receiver[listener[@className='nl.nn.adapterframework.receivers.JavaListener' and @name=current()/@javaListener]]"/>
		<xsl:if test="exists($targetReceiver)">
			<xsl:element name="forward">
				<xsl:attribute name="name" select="'differentAdapter'"/>
				<xsl:attribute name="path" select="$targetReceiver/parent::adapter/@name"/>
				<xsl:attribute name="targetID" select="generate-id($targetReceiver)"/>
			</xsl:element>
		</xsl:if>
	</xsl:template>

	<xsl:template match="forward" mode="preprocess">
		<xsl:param name="pipeline" select="ancestor::pipeline"/>
		<xsl:param name="parentName" select="parent::*/name()"/>
		<xsl:copy>
			<xsl:attribute name="elementID" select="generate-id()"/>
			<xsl:variable name="target" select="$pipeline/(pipe[@name=current()/@path]|.//exit[@name=current()/@path])[1]"/>
			<!-- When the forward is an exit, link it to the corresponding outputWrapper or outputValidator -->
			<xsl:choose>
				<xsl:when test="name($target)='exit'">
					<xsl:choose>
						<xsl:when test="not($parentName = ('outputWrapper','outputValidator')) and exists($pipeline/outputWrapper)">
							<xsl:attribute name="targetID" select="concat(generate-id($pipeline/outputWrapper), '-', $target/@name)"/>
<!--							This was used to show what exit this was forwarding to when a validator was made only once for the pipeline.
								Now that a validator is made for every exit, it is no longer necessary to show which exit this is going to.-->
<!--							<xsl:attribute name="customText" select="$target/@name"/>-->
						</xsl:when>
						<xsl:when test="$parentName != 'outputValidator' and exists(($pipeline/outputValidator,$pipeline/inputValidator[@responseRoot]))">
							<xsl:attribute name="targetID" select="concat(generate-id($pipeline/(outputValidator,inputValidator[@responseRoot])[1]), '-', $target/@name)"/>
<!--							<xsl:attribute name="customText" select="$target/@name"/>-->
						</xsl:when>
						<xsl:otherwise>
							<xsl:attribute name="targetID" select="generate-id($target)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
					<xsl:choose>
						<xsl:when test="$parentName = 'inputValidator' and @name = 'success' and exists($pipeline/inputWrapper)">
							<xsl:attribute name="targetID" select="generate-id($pipeline/inputWrapper)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:attribute name="targetID" select="generate-id($target)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:apply-templates select="@*|*" mode="#current"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="*" mode="sort">
		<xsl:param name="finalProcessing" as="xs:boolean" select="true()"/>
		<xsl:param name="errorHandling" as="xs:boolean" select="false()"/>
		<xsl:param name="originalPipes"/>

		<xsl:variable name="newOriginalPipes">
			<xsl:copy-of select="$originalPipes/*[@elementID != current()/@elementID]"/>
		</xsl:variable>

		<xsl:variable name="processedPipes">
			<xsl:variable name="forwards">
				<xsl:for-each select="forward">
					<pair>
						<xsl:variable name="target" select="$newOriginalPipes/*[@elementID=current()/@targetID]"/>
						<xsl:copy>
							<xsl:attribute name="errorHandling" select="$errorHandling or @name = $errorForwards or $target/type = 'errorhandling'"/>
							<xsl:copy-of select="@*|*"/>
						</xsl:copy>
						<xsl:copy-of select="$target"/>
					</pair>
				</xsl:for-each>
			</xsl:variable>

			<xsl:copy>
				<xsl:attribute name="errorHandling" select="$errorHandling"/>
				<xsl:copy-of select="@*|*[name() != 'forward']"/>
				<xsl:copy-of select="$forwards/pair/forward"/>
			</xsl:copy>

			<xsl:for-each select="$forwards/pair">
				<xsl:apply-templates select="*[name() != 'forward']" mode="#current">
					<xsl:with-param name="finalProcessing" select="false()"/>
					<xsl:with-param name="errorHandling" select="forward/@errorHandling"/>
					<xsl:with-param name="originalPipes">
						<xsl:copy-of select="$newOriginalPipes"/>
					</xsl:with-param>
				</xsl:apply-templates>
			</xsl:for-each>
		</xsl:variable>

		<!-- When processing the pipes via forwards, loops might result in pipes being duplicated, keep only 1 of each pipe with a preference for errorHandling=false-->
		<xsl:choose>
			<xsl:when test="$finalProcessing">
				<xsl:for-each-group select="$processedPipes/*" group-by="@elementID">
					<xsl:copy-of select="(current-group()[not(xs:boolean(@errorHandling))],current-group()[xs:boolean(@errorHandling)])[1]"/>
				</xsl:for-each-group>
			</xsl:when>
			<xsl:otherwise><xsl:copy-of select="$processedPipes"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="defaultCopyActions">
		<xsl:attribute name="elementID" select="generate-id()"/>
		<xsl:apply-templates select="@*|*" mode="#current"/>
		<xsl:call-template name="styleElement"/>
	</xsl:template>

	<xsl:template name="defaultPipeCopyActions">
		<xsl:call-template name="defaultCopyActions"/>
		<xsl:apply-templates select="../global-forwards/forward[not(@name = current()/forward/@name)]" mode="#current"/>
	</xsl:template>

	<xsl:template name="switchPipeCopyActions">
		<xsl:attribute name="elementID" select="generate-id()"/>
		<xsl:apply-templates select="@*|*[name() != 'forward']" mode="#current"/>
		<xsl:call-template name="styleElement"/>
	</xsl:template>

	<xsl:template name="styleElement">
		<xsl:variable name="type" select="$frankElements/*[name()=(current()/@className,current()/name())][1]"/>
		<xsl:choose>
			<xsl:when test="$type/type = 'endpoint' and count(sender) = 1">
				<xsl:variable name="newType" select="$frankElements/*[name()=current()/sender/@className]"/>
				<xsl:copy-of select="($newType,$type)[1]/type"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:copy-of select="$type/type"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:if test="attribute,$type/attribute">
			<xsl:for-each-group select="attribute,$type/attribute" group-by="@name">
				<attribute>
					<xsl:if test="not(current-group()[1]/@showValue)">
						<xsl:attribute name="showValue">true</xsl:attribute>
					</xsl:if>
					<xsl:copy-of select="current-group()[1]/(@*,*)"/>
				</attribute>
			</xsl:for-each-group>
		</xsl:if>
	</xsl:template>

	<xsl:template name="createForwardIfNecessary">
		<xsl:param name="forwards"/>
		<xsl:param name="name" select="''"/>
		<xsl:param name="path" select="''"/>
		<xsl:if test="$name != '' and $path != '' and empty($forwards[@name=$name])">
			<xsl:call-template name="createForward">
				<xsl:with-param name="name" select="$name"/>
				<xsl:with-param name="path" select="$path"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template name="createForward">
		<xsl:param name="path"/>
		<xsl:param name="name" select="$path"/>

		<xsl:variable name="forward">
			<xsl:element name="forward">
				<xsl:attribute name="name" select="$name"/>
				<xsl:attribute name="path" select="$path"/>
			</xsl:element>
		</xsl:variable>
		<xsl:apply-templates select="$forward/forward" mode="#current">
			<!--Scope is the variable which has no parent, so explicitly pass pipeline parameter-->
			<xsl:with-param name="pipeline" select="ancestor::pipeline"/>
			<xsl:with-param name="parentName" select="name()"/>
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template match="*" mode="convertElements">
		<xsl:apply-templates select="*" mode="#current"/>
	</xsl:template>

	<xsl:template match="adapter" mode="convertElements">
		<xsl:if test="number($adapterCount) gt 1">
			<xsl:text>	style </xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text> fill:#0000,stroke:#1a9496,stroke-width:2px&#10;</xsl:text>
			<xsl:text>	subgraph </xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>&#10;</xsl:text>
		</xsl:if>
		<xsl:apply-templates select="*" mode="#current">
			<xsl:with-param name="extensive" select="@extensive = 'true'" tunnel="yes"/>
		</xsl:apply-templates>
		<xsl:if test="number($adapterCount) gt 1">
			<xsl:text>	end&#10;</xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="receiver" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="(@name,'Receiver')[1]"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="inputValidator" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="(@name,'InputValidator')[1]"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="inputWrapper" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="(@name,'InputWrapper')[1]"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="outputWrapper" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="(@name,'OutputWrapper')[1]"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="outputValidator" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="(@name,'OutputValidator')[1]"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template match="pipe" mode="convertElements">
		<xsl:call-template name="createMermaidElement"/>
	</xsl:template>

	<xsl:template match="exit" mode="convertElements">
		<xsl:call-template name="createMermaidElement">
			<xsl:with-param name="text" select="@state"/>
			<xsl:with-param name="subText" select="@code"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:variable name="shapeStartMap">
		<field type="endpoint"><![CDATA[>]]></field>
		<field type="validator">([</field>
		<field type="wrapper">[[</field>
		<field type="translator">(</field>
		<field type="iterator">[/</field>
		<field type="router">{{</field>
		<field type="session">[/</field>
		<field type="errorhandling">[</field>
		<field type="database">[(</field>
	</xsl:variable>
	<xsl:variable name="shapeEndMap">
		<field type="endpoint">]</field>
		<field type="validator">])</field>
		<field type="wrapper">]]</field>
		<field type="translator">)</field>
		<field type="iterator">\]</field>
		<field type="router">}}</field>
		<field type="session">/]</field>
		<field type="errorhandling">]</field>
		<field type="database">)]</field>
	</xsl:variable>
	<xsl:template name="createMermaidElement">
		<xsl:param name="text" select="xs:string((@name,name())[1])"/>
		<xsl:param name="subText" select="(listener/@className,sender/@className,@className)[1]"/>
		<xsl:param name="extensive" tunnel="yes" select="'false'"/>

		<xsl:text>	</xsl:text>
		<xsl:value-of select="@elementID"/>
		<xsl:value-of select="($shapeStartMap/field[@type = current()/type],'(')[1]"/>
		<xsl:text>"<![CDATA[<b>]]></xsl:text>
		<xsl:value-of select="$text"/>
		<xsl:text><![CDATA[</b>]]></xsl:text>
		<xsl:if test="$subText != ''">
			<xsl:text><![CDATA[<br/>]]></xsl:text>
			<xsl:if test="$extensive and contains($subText, '.')">
				<xsl:text><![CDATA[<a style='color:#909090;'>]]></xsl:text>
				<xsl:value-of select="tokenize($subText, '\.')[position() != last()]" separator="."/>
				<xsl:text>.<![CDATA[</a>]]></xsl:text>
			</xsl:if>
			<xsl:value-of select="tokenize($subText, '\.')[last()]"/>
		</xsl:if>
		<xsl:if test="$extensive">
			<xsl:choose>
				<xsl:when test="@getInputFromFixedValue != ''">
					<xsl:text><![CDATA[<br/>]]></xsl:text>
					<xsl:text>fixed input: </xsl:text>
					<xsl:text><![CDATA[<i>]]></xsl:text>
					<xsl:value-of select="replace(@getInputFromFixedValue, '&lt;', '&amp;lt;')"/>
					<xsl:text><![CDATA[</i>]]></xsl:text>
				</xsl:when>
				<xsl:when test="@getInputFromSessionKey != ''">
					<xsl:text><![CDATA[<br/>]]></xsl:text>
					<xsl:text>input sessionKey: </xsl:text>
					<xsl:text><![CDATA[<i>]]></xsl:text>
					<xsl:value-of select="@getInputFromSessionKey"/>
					<xsl:text><![CDATA[</i>]]></xsl:text>
				</xsl:when>
			</xsl:choose>
			<xsl:if test="attribute">
				<xsl:for-each select="@*[name() = current()/attribute/@name]">
					<xsl:text><![CDATA[<br/>]]></xsl:text>
					<xsl:variable name="specialAttr" select="../attribute[@name = current()/name()][1]"/>
					<xsl:value-of select="if($specialAttr/@text) then ($specialAttr/@text) else (concat($specialAttr/@name,': '))"/>
					<xsl:if test="$specialAttr/@showValue = 'true'">
						<xsl:text><![CDATA[<i>]]></xsl:text>
						<xsl:value-of select="."/>
						<xsl:text><![CDATA[</i>]]></xsl:text>
					</xsl:if>
				</xsl:for-each>
			</xsl:if>
			<xsl:if test="@storeResultInSessionKey != ''">
				<xsl:text><![CDATA[<br/>]]></xsl:text>
				<xsl:text>output sessionKey: </xsl:text>
				<xsl:text><![CDATA[<i>]]></xsl:text>
				<xsl:value-of select="@storeResultInSessionKey"/>
				<xsl:text><![CDATA[</i>]]></xsl:text>
			</xsl:if>
			<xsl:if test="@preserveInput = 'true'">
				<xsl:text><![CDATA[<br/>]]></xsl:text>
				<xsl:text>replaces result with computed pipe input</xsl:text>
			</xsl:if>
		</xsl:if>
		<xsl:text>"</xsl:text>
		<xsl:value-of select="($shapeEndMap/field[@type = current()/type],')')[1]"/>
		<xsl:text>:::</xsl:text>
		<xsl:choose>
			<xsl:when test="xs:boolean(@errorHandling)">
				<xsl:text>errorOutline</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>normal</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:text>&#10;</xsl:text>
	</xsl:template>

	<xsl:template match="forward" mode="convertForwards">
		<xsl:text>	</xsl:text>
		<xsl:value-of select="parent::*/@elementID"/>
		<xsl:text> --> |</xsl:text>
		<xsl:value-of select="@name"/>
		<xsl:if test="exists(@customText)">
			<xsl:text><![CDATA[<br/>]]></xsl:text>
			<xsl:value-of select="@customText"/>
		</xsl:if>
		<xsl:text>| </xsl:text>
		<xsl:value-of select="@targetID"/>
		<xsl:text>&#10;</xsl:text>
	</xsl:template>
</xsl:stylesheet>
